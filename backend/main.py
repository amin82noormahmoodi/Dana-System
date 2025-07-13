from datetime import timedelta
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth import authenticate_user, create_access_token, get_current_user
from rag import rag_system
from config import settings

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Token(BaseModel):
    access_token: str
    token_type: str

class QueryRequest(BaseModel):
    query: str

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="نام کاربری یا رمز عبور اشتباه است",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/query")
async def query_rag(query_request: QueryRequest, current_user: dict = Depends(get_current_user)):
    """Query the RAG system based on username"""
    try:
        username = current_user["username"]
        
        if username == "modir":
            response = rag_system.companies_rag(query_request.query)
        elif username == "sina":
            response = rag_system.sina_rag(query_request.query)
        elif username == "irantire":
            response = rag_system.irantire_rag(query_request.query)
        elif username == "behran":
            response = rag_system.behran_rag(query_request.query)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="نام کاربری نامعتبر"
            )
        
        if not response:  # اگر پاسخی از RAG دریافت نشد
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="پاسخی برای پرسش شما یافت نشد"
            )
        
        return {"response": response}
    
    except HTTPException as he:  # خطاهای HTTP را مستقیماً پاس میدهیم
        raise he
    except Exception as e:
        print(f"Error in query_rag: {str(e)}")  # لاگ کردن خطا برای دیباگ
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="خطای داخلی سرور. لطفاً دوباره تلاش کنید"
        )

@app.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return current_user 