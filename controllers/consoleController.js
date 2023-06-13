const router = require('express').Router()
const ConsoleModel = require('../models/consoleModel')
const { DateTime } = require("luxon");

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
    let searchOptions = {}
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

router.post('/games/:id/add', async (req, res) => {
    try {
        // converting the on/off value from checkbox to true/false
        if(req.body.isCompleted == 'on'){
        req.body.isCompleted = true
      } else {
        req.body.isCompleted = false
      }
  
      await ConsoleModel.findByIdAndUpdate(req.params.id, {
        $push: {
          games: req.body
        },
      });
  
      res.redirect("/");
    } catch (e) {
      console.log(e);
    }
  });
  
  

// Editing games inside console
router.get("/console/:consoleid/games/:id/update", async (req,res) =>{
    const games = await ConsoleModel.findOne({'games._id': req.params.id}, {"games.$": 1})

    const game = games.games[0]
    // console.log(DateTime.fromJSDate(game.dateBoughtGame).toFormat("yyyy-MM-dd"))
    res.render("console/updateGame",{ games: {

      dateBoughtGame: DateTime.fromJSDate(game.dateBoughtGame).toFormat("yyyy-MM-dd"),
      gameName: game.gameName,
      gamePrice: game.gamePrice,
      isCompleted: game.isCompleted,
      hoursPlayed: game.hoursPlayed
    }
  })
    // console.log(req.params.consoleid)
    // console.log(req.params.id)
    // console.log(games)
})

//router.put to edit games go here



// Deleting games inside console
router.delete("/console/:consoleid/games/:id", async (req, res) => {
    try {
      const console = await ConsoleModel.findById(req.params.consoleid);
  
      if (!console) {
        return res.status(404).send('Page not found');
      }
      // Remove the game from the games array
      console.games.pull(req.params.id);
      await console.save();
  
    } catch (e) {
      console.error(e);

    }
  });
  

module.exports = router