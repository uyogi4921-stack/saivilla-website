import base64
import hashlib
import hmac
import logging
import os
import secrets
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

TOKEN_TTL_SECONDS = 12 * 60 * 60  # 12 hours

_bearer_scheme = HTTPBearer(auto_error=False)


DEFAULT_ADMIN_USERNAME = "sureshyogi"


def _get_admin_username() -> str:
    # Not a secret — the password is what gates access.
    return os.environ.get("ADMIN_USERNAME", DEFAULT_ADMIN_USERNAME)


# PBKDF2 hash of the admin password. Safe to keep in the repository: it cannot be
# reversed into the password. ADMIN_PASSWORD (plain) or ADMIN_PASSWORD_HASH set in
# the hosting dashboard override it.
DEFAULT_ADMIN_PASSWORD_HASH = (
    "pbkdf2_sha256$600000$1jVcwYpR0cHZxcfbdDoXCQ==$N6iYmZZoNjmcljvW2kSZPBpsw4eEur/wbll2FCbrYi4="
)

PBKDF2_ITERATIONS = 600_000


def hash_password(password: str, *, iterations: int = PBKDF2_ITERATIONS, salt: Optional[bytes] = None) -> str:
    salt = salt if salt is not None else secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return f"pbkdf2_sha256${iterations}${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def _get_password_hash() -> str:
    plain = os.environ.get("ADMIN_PASSWORD")
    if plain:
        return hash_password(plain)
    return os.environ.get("ADMIN_PASSWORD_HASH") or DEFAULT_ADMIN_PASSWORD_HASH


def verify_password(candidate: str, encoded: str) -> bool:
    try:
        algorithm, iterations, salt_b64, digest_b64 = encoded.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        expected = base64.b64decode(digest_b64)
        actual = hashlib.pbkdf2_hmac("sha256", candidate.encode(), base64.b64decode(salt_b64), int(iterations))
    except (ValueError, TypeError):
        logger.error("ADMIN_PASSWORD_HASH is malformed; refusing all logins")
        return False
    return hmac.compare_digest(actual, expected)


# Tokens must not be forgeable from anything public, so the fallback is a random
# per-process key rather than something derived from the (public) password hash.
# Sessions then end when the server restarts unless ADMIN_TOKEN_SECRET is set.
_EPHEMERAL_TOKEN_SECRET = secrets.token_hex(32)


def _get_signing_secret() -> bytes:
    secret = os.environ.get("ADMIN_TOKEN_SECRET") or _EPHEMERAL_TOKEN_SECRET
    return hashlib.sha256(("saivilla-admin::" + secret).encode()).digest()


def _sign(payload: str) -> str:
    digest = hmac.new(_get_signing_secret(), payload.encode(), hashlib.sha256).digest()
    return base64.urlsafe_b64encode(digest).decode().rstrip("=")


def create_admin_token() -> str:
    expiry = str(int(time.time()) + TOKEN_TTL_SECONDS)
    return f"{expiry}.{_sign(expiry)}"


def verify_admin_token(token: str) -> bool:
    try:
        expiry, signature = token.split(".", 1)
    except ValueError:
        return False
    if not hmac.compare_digest(signature, _sign(expiry)):
        return False
    return int(expiry) > time.time()


async def require_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> None:
    if credentials is None or not verify_admin_token(credentials.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin session. Please log in again.",
        )


class AdminLoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1, max_length=200)


class AdminLoginResponse(BaseModel):
    success: bool
    token: str
    expiresIn: int


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(payload: AdminLoginRequest):
    # Compare both before deciding, so a wrong username costs the same as a wrong
    # password and the response cannot be used to confirm a valid username.
    username_ok = hmac.compare_digest(payload.username.strip().lower(), _get_admin_username().lower())
    password_ok = verify_password(payload.password, _get_password_hash())

    if not (username_ok and password_ok):
        logger.warning("Failed admin login attempt for username %r", payload.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    logger.info("Admin logged in")
    return AdminLoginResponse(
        success=True,
        token=create_admin_token(),
        expiresIn=TOKEN_TTL_SECONDS,
    )


@router.get("/stats", dependencies=[Depends(require_admin)])
async def get_admin_stats():
    from routes.inquiries import get_db

    db = get_db()
    inquiries = db.inquiries

    total = await inquiries.count_documents({})
    counts = {}
    for state in ("new", "contacted", "closed"):
        counts[state] = await inquiries.count_documents({"status": state})

    return {"total": total, "byStatus": counts}
