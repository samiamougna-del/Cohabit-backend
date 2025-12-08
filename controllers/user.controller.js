 
export const studentBoard = (req, res) => {
    res.status(200).send("Student Content.");
};
 
export const seniorBoard = (req, res) => {
    res.status(200).send("Senior Content.");
};
 
export const adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
}