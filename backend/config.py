from pydantic_settings import BaseSettings
from typing import Dict, ClassVar

class Settings(BaseSettings):
    # JWT settings
    SECRET_KEY: str = "your-secret-key-here"  # در محیط production باید تغییر کند
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # OpenAI API Key
    OPENAI_API_KEY: str = "OPENAI_API_KEY"

    # User credentials
    USERS: ClassVar[Dict[str, Dict[str, str]]] = {
        "modir": {
            "username": "modir",
            "password": "modir",
            "role": "holding_manager"
        },
        "sina": {
            "username": "sina",
            "password": "sina",
            "role": "company_manager",
            "company": "sina"
        },
        "irantire": {
            "username": "irantire",
            "password": "irantire",
            "role": "company_manager",
            "company": "irantire"
        },
        "behran": {
            "username": "behran",
            "password": "behran",
            "role": "company_manager",
            "company": "behran"
        }
    }

settings = Settings() 