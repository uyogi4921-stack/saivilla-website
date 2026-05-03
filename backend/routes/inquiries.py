from fastapi import APIRouter, HTTPException, status
from models.inquiry import InquiryCreate, Inquiry, InquiryResponse
from typing import List
import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/inquiries", tags=["inquiries"])

# Lazy import to avoid circular dependency
_db = None

def get_db():
    global _db
    if _db is None:
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        client = AsyncIOMotorClient(mongo_url)
        _db = client[os.environ.get('DB_NAME', 'test_database')]
    return _db


@router.post("/", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED)
async def create_inquiry(inquiry_data: InquiryCreate):
    try:
        db = get_db()
        inquiries_collection = db.inquiries

        inquiry = Inquiry(**inquiry_data.model_dump())
        inquiry_doc = inquiry.model_dump()
        inquiry_doc['createdAt'] = inquiry_doc['createdAt'].isoformat()
        inquiry_doc['updatedAt'] = inquiry_doc['updatedAt'].isoformat()
        result = await inquiries_collection.insert_one(inquiry_doc)

        if result.inserted_id:
            logger.info(f"New inquiry created: {inquiry.id} from {inquiry.email}")

            try:
                from services.email_service import send_inquiry_notification
                await send_inquiry_notification(inquiry.model_dump())
            except Exception as email_error:
                logger.error(f"Email notification failed: {str(email_error)}")

            return InquiryResponse(
                success=True,
                message="Thank you for your inquiry! Our team will contact you within 24 hours.",
                inquiryId=inquiry.id
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save inquiry"
            )

    except Exception as e:
        import traceback
        logger.error(f"Error creating inquiry: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error: {str(e)}"
        )


@router.get("/", response_model=List[Inquiry])
async def get_all_inquiries(
    status_filter: str = None,
    limit: int = 100,
    skip: int = 0
):
    try:
        db = get_db()
        inquiries_collection = db.inquiries

        query = {}
        if status_filter:
            query["status"] = status_filter

        inquiries = await inquiries_collection.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
        return [Inquiry(**inquiry) for inquiry in inquiries]

    except Exception as e:
        logger.error(f"Error fetching inquiries: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch inquiries"
        )


@router.get("/{inquiry_id}", response_model=Inquiry)
async def get_inquiry_by_id(inquiry_id: str):
    try:
        db = get_db()
        inquiries_collection = db.inquiries

        inquiry = await inquiries_collection.find_one({"id": inquiry_id})

        if not inquiry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inquiry not found"
            )

        return Inquiry(**inquiry)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching inquiry {inquiry_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch inquiry"
        )


@router.patch("/{inquiry_id}/status")
async def update_inquiry_status(inquiry_id: str, new_status: str):
    try:
        db = get_db()
        inquiries_collection = db.inquiries

        if new_status not in ["new", "contacted", "closed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status. Must be 'new', 'contacted', or 'closed'"
            )

        from datetime import datetime
        result = await inquiries_collection.update_one(
            {"id": inquiry_id},
            {"$set": {"status": new_status, "updatedAt": datetime.utcnow()}}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inquiry not found"
            )

        return {"success": True, "message": "Inquiry status updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating inquiry status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update inquiry status"
        )


@router.delete("/{inquiry_id}")
async def delete_inquiry(inquiry_id: str):
    try:
        db = get_db()
        inquiries_collection = db.inquiries

        result = await inquiries_collection.delete_one({"id": inquiry_id})

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inquiry not found"
            )

        return {"success": True, "message": "Inquiry deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting inquiry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete inquiry"
        )
