from pydantic import BaseModel, EmailStr

class SignupValidator(BaseModel):
    username: str
    email: str
    password: str
    confirmPassword: str

    @field_validator("confirmPassword")
    def matchingPasswords(cls, currentValue, info):
        if "password" in info.data and currentValue != info.data["password"]:
            raise ValueError["Passwords must be the same"]
        return currentValue 

# cls - current class we are validating
# currentValue or V - current value we are validating in @field_validator
# info // info.data all the currently validated fields in this class up until this point of custom validator