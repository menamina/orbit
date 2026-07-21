from fastapi import FastAPI

router = FastAPI()

@router.get("/")

@router.get("/api/login")
@router.get("/api/signup")
@router.get("/api/logout")

@router.get("/api/month/:month/:year")

# ======== PILL ======== 
@router.post("/api/track/pill")
@router.delete("/api/track/pill/delete/:pillID")

# ======== CYCLE ======== 
@router.post("/api/track/period")
@router.delete("/api/track/pill/delete/:pillID")

# ======== SETTINGS ======== 
@router.get("/api/settings")
@router.patch("/api/update/icon")
@router.patch("/api/update/color")
@router.patch("/api/update/password")
@router.patch("/api/update/email")

# ======== DLT ACC ======== 
@router.delete("/api/delete/account")

