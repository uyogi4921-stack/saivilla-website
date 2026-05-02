from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid


class InquiryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    propertyInterest: Optional[str] = Field(None, max_length=200)
    message: str = Field(..., min_length=10, max_length=1000)


class Inquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    propertyInterest: Optional[str] = None
    message: str
    status: str = Field(default="new")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class InquiryResponse(BaseModel):
    success: bool
    message: str
    inquiryId: Optional[str] = None
