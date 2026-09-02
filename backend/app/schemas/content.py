from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    author_name: str
    author_role: str = "Member"
    avatar_url: str = ""
    rating: int = 5
    content: str


class ReviewResponse(BaseModel):
    id: int
    author_name: str
    author_role: str
    avatar_url: str
    rating: int
    content: str
    is_featured: bool
    created_at: datetime

    class Config:
        from_attributes = True


class FeedbackCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


class FeedbackResponse(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
