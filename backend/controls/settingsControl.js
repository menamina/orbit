import prisma from "../prisma/client";

async function settingsUpdate(req, res){
    try {

        const userID = Number(req.user.userID)
        const { name, username, email } = req.body

    } catch(error){

    }
}


async function changePassword(req, res){
    try {



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