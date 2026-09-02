import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import get_settings
from app.database import engine, Base
from app.routers import auth, users, plans, dashboard, content, admin, community, sleep, diet, live_class
from app.utils.logging_config import setup_logging, log_request_middleware

settings = get_settings()

# ── Logging ──────────────────────────────────────────────────────────────────
setup_logging(debug=settings.debug)
logger = logging.getLogger("yogacare")


# ── Lifespan (replaces deprecated on_event) ──────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting YogaCare API (env=%s)", settings.env)
    Base.metadata.create_all(bind=engine)

    # SQLite Self-healing database patch
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            cursor = conn.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in cursor.fetchall()]
            if "xp" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0"))
                logger.info("Added 'xp' column to users table")
            if "level" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN level VARCHAR(50) DEFAULT 'Beginner'"))
                logger.info("Added 'level' column to users table")
            conn.commit()
    except Exception as e:
        logger.warning("Could not execute SQLite self-healing patch: %s", e)

    # Seed only in development — in production, run migrations separately
    if not settings.is_production:
        from app.seed import seed_database
        seed_database()
        logger.info("Database seeded (dev mode)")
    else:
        # In production still ensure admin exists but skip demo data
        from app.seed import seed_database
        seed_database()
        logger.info("Admin account ensured (prod mode)")

    yield
    logger.info("YogaCare API shutting down")


# ── App Factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    description="Premium AI-powered yoga fitness platform",
    version="1.0.0",
    lifespan=lifespan,
    # Hide docs in production for security
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url="/openapi.json" if not settings.is_production else None,
)

# ── Middleware ────────────────────────────────────────────────────────────────
if settings.is_production:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
app.add_middleware(BaseHTTPMiddleware, dispatch=log_request_middleware)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(plans.router)
app.include_router(dashboard.router)
app.include_router(content.router)
app.include_router(admin.router)
app.include_router(community.router)
app.include_router(sleep.router)
app.include_router(diet.router)
app.include_router(live_class.router)


# ── Utility Endpoints ─────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "app": "YogaCare API",
        "status": "running",
        "env": settings.env,
        "docs": "/docs" if not settings.is_production else "disabled in production",
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}
