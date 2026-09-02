# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings
from functools import lru_cache
import warnings


class Settings(BaseSettings):
    # Application
    env: str = "development"  # "development" or "production"
    debug: bool = False
    app_name: str = "YogaCare API"

    # Database
    database_url: str = "sqlite:///./lotusflow.db"

    # Auth / Security
    secret_key: str = "CHANGE_ME_IN_PRODUCTION_USE_LONG_RANDOM_STRING"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # CORS
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Admin
    admin_email: str = "admin@yogacare.com"
    admin_password: str = "Admin@123456"

    class Config:
        env_file = ".env"
        extra = "ignore"

    @property
    def is_production(self) -> bool:
        return self.env.lower() == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    def validate_production(self) -> None:
        """Emit warnings for insecure settings in production."""
        if self.is_production:
            if "CHANGE_ME" in self.secret_key or len(self.secret_key) < 32:
                warnings.warn(
                    "[SECURITY] SECRET_KEY is weak or default. Set a strong random key in production!",
                    stacklevel=2,
                )
            if "Admin@123456" in self.admin_password:
                warnings.warn(
                    "[SECURITY] ADMIN_PASSWORD is still the default. Change it before deploying!",
                    stacklevel=2,
                )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.validate_production()
    return settings
