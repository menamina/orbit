from fastapi import APIRouter

from controls import loginSignup

from utils import isAuth
from utils.signupValidation import SignupValidator

router = APIRouter()

@router.get("/")

@router.post("/api/signup")
def signup(signupData: SignupValidator):
    return loginSignup.signup_user(signupData)


@router.get("/api/login")
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