from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.community import CommunityPost, PostLike, PostComment
from app.utils.deps import get_current_user

router = APIRouter(prefix="/api/community", tags=["Community"])

class PostCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None

class CommentCreate(BaseModel):
    content: str

@router.get("/posts")
def get_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    posts = db.query(CommunityPost).order_by(CommunityPost.created_at.desc()).limit(50).all()
    result = []
    for post in posts:
        liked = db.query(PostLike).filter(PostLike.post_id == post.id, PostLike.user_id == current_user.id).first() is not None
        comments = []
        for c in sorted(post.comments, key=lambda x: x.created_at):
            comments.append({
                "id": c.id,
                "author_name": c.author_name,
                "content": c.content,
                "created_at": c.created_at.isoformat()
            })
        result.append({
            "id": post.id,
            "user_id": post.user_id,
            "author_name": post.author_name,
            "title": post.title,
            "content": post.content,
            "image_url": post.image_url,
            "likes_count": post.likes_count,
            "liked_by_me": liked,
            "comments": comments,
            "created_at": post.created_at.isoformat()
        })
    return result

@router.post("/posts")
def create_post(
    data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = CommunityPost(
        user_id=current_user.id,
        author_name=current_user.full_name,
        title=data.title,
        content=data.content,
        image_url=data.image_url,
        likes_count=0
    )
    db.add(post)
    
    # Award some XP for sharing!
    current_user.xp += 15
    if current_user.xp >= 500:
        current_user.level = "Yoga Master"
    elif current_user.xp >= 150:
        current_user.level = "Intermediate"
    
    db.commit()
    db.refresh(post)
    return {"message": "Post created successfully", "post_id": post.id, "xp_earned": 15}

@router.post("/posts/{post_id}/like")
def toggle_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    like = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == current_user.id).first()
    if like:
        db.delete(like)
        post.likes_count = max(0, post.likes_count - 1)
        liked_status = False
    else:
        db.add(PostLike(post_id=post_id, user_id=current_user.id))
        post.likes_count += 1
        liked_status = True
        
        # Award 5 XP for engagement!
        current_user.xp += 5
        if current_user.xp >= 500:
            current_user.level = "Yoga Master"
        elif current_user.xp >= 150:
            current_user.level = "Intermediate"

    db.commit()
    return {"liked": liked_status, "likes_count": post.likes_count}

@router.post("/posts/{post_id}/comment")
def add_comment(
    post_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment = PostComment(
        post_id=post_id,
        user_id=current_user.id,
        author_name=current_user.full_name,
        content=data.content
    )
    db.add(comment)
    
    # Award 10 XP for commenting!
    current_user.xp += 10
    if current_user.xp >= 500:
        current_user.level = "Yoga Master"
    elif current_user.xp >= 150:
        current_user.level = "Intermediate"

    db.commit()
    return {
        "message": "Comment added",
        "comment": {
            "id": comment.id,
            "author_name": comment.author_name,
            "content": comment.content,
            "created_at": comment.created_at.isoformat()
        }
    }
