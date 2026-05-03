from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime, timezone
import uuid


class InquiryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    propertyInterest: Optional[str] = Field(None, max_length=200)
    message: str = Field(..., min_length=10, max_length=1000)


class Inquiry(BaseModel):
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    propertyInterest: Optional[str] = None
    message: str
    status: str = Field(default="new")
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InquiryResponse(BaseModel):
    success: bool
    message: str
    inquiryId: Optional[str] = None
