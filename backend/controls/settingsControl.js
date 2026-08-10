import prisma from "../prisma/client";
import { passwordGenie, checkPassword } from "../utils/passwordUtil";

async function settingsUpdate(req, res){
    try {

        const userID = Number(req.user.userID)
        const { name, username, email } = req.body

        if (name === "" && username === "" && email === ""){
            return res.status(400).json({error: "Cannot update with empty values"})
        }

        const updatedUser = await prisma.user.update({
            where: { id: userID },
            data: {
                ...(name && {name}),
                ...(username && {username}),
                ...(email && {email})
            }
        })


        // check user + email in front end

        return res.status(200).json({success: true})

    } catch(error){
        console.log(error);
        return res.status(500).json({ serverError: "Server error" });

    }
}


async function changePassword(req, res){
    try {

        const userID = Number(req.user.userID)
        const { oldPassword, password } = req.body

        const user = await prisma.settings.findUnique({
            where: { userId: userID }
        });

        const match = checkPassword(oldPassword, user.saltedHash)

            if (!isValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

        const newPassword = passwordGenie(password)

        await prisma.settings.update({
      where: { userId: userID },
      data: { saltedHash: newPassword }
    });

       return res.status(200).json({success: true})

    } catch(error){
        console.log(error);
        return res.status(500).json({ serverError: "Server error" });
    }
}
// ------- cycle info + algs  \\
async function cycleInfo(req, res) {
  try {
    const userID = Number(req.user.userID);
    const cycleLength = Number(req.body.cyclelength);
    const daysBetweenPeriod = Number(req.body.daysbetweenperiod);
    
    const updatedSettings = 
    // count from day one
  } catch (error) {}
}

async function updateCycleInfo(req, res) {
  try {
  } catch (error) {}
}

module.exports = {
    changePassword,
    cycleInfo,
    updateCycleInfo
}