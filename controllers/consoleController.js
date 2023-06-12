const router = require('express').Router()
const ConsoleModel = require('../models/consoleModel')

router.get("/", async(req,res) => {
    try{
        const consoleList = await ConsoleModel.find()
        res.render("console/index", {consoleList: consoleList})
    } catch (e){
        console.log(e)
    }
})

// showing all games for a console
router.get('/console/:id/details', async(req,res) => {
    try{
        const consoleItem = await ConsoleModel.findById(req.params.id)
        res.render('console/showGames', {consoleItem: consoleItem})
    } catch (e) {
        console.log (e)
    }
})

// Adding consoles to main page
router.get("/add_console", (req,res) =>{
    res.render('console/addConsole')
})

router.post("/add_console", async (req,res) => {
    try{
        const consoleInfo = new ConsoleModel(req.body)
        await consoleInfo.save()
        res.redirect('/')
    }catch (e) {
        console.log(e)
        res.redirect('/add_console')
    }
})

// Adding games to individual consoles
router.get("/games/:id/add", (req,res) => {
    res.render('console/addGame', {consoleId: req.params.id})
})

router.post('/games/:id/add', async(req,res) => {
    try{
        await ConsoleModel.findByIdAndUpdate(req.params.id, {
            $push: {
                games: req.body
            }
        })
        res.redirect("/")
    } catch (e) {
        console.log(e)
    }
})

// Editing games inside controller
router.get("/console/:consoleid/games/:id/update", (req,res) =>{
    const games = ConsoleModel.findById(req.params.id)
    res.render('console/updateGame', {games})
})


module.exports = router