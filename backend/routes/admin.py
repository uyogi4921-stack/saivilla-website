import base64
import hashlib
import hmac
import logging
import os
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


def _get_admin_password() -> Optional[str]:
    return os.environ.get("ADMIN_PASSWORD")


def _get_signing_secret() -> bytes:
    # Dedicated secret preferred; falls back to a key derived from the password
    secret = os.environ.get("ADMIN_TOKEN_SECRET") or _get_admin_password() or ""
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
    if not _get_admin_password():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin access is not configured (ADMIN_PASSWORD not set)",
        )
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
    admin_password = _get_admin_password()
    if not admin_password:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin access is not configured (ADMIN_PASSWORD not set)",
        )

    # Compare both before deciding, so a wrong username costs the same as a wrong
    # password and the response cannot be used to confirm a valid username.
    username_ok = hmac.compare_digest(payload.username.strip().lower(), _get_admin_username().lower())
    password_ok = hmac.compare_digest(payload.password, admin_password)

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
