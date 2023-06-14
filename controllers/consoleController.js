const router = require('express').Router()
const ConsoleModel = require('../models/consoleModel')
const { DateTime } = require("luxon");
const passport = require("passport");
const User = require("../models/userModel");
const { upload } = require("../config/multer.config");
const secureUser = require("../config/securepage.config")


// router.get("/", secureUser, async (req, res) => {
//   try {
//     const consoleList = await ConsoleModel.find();

//     // calculate the sum of gamePrice for all consoles
//     const priceSum = consoleList.reduce((total, console) => {
//       return total + console.games.reduce((gameTotal, game) => {
//         return gameTotal + game.gamePrice;
//       }, 0);
//     }, 0);

//     // calculate the sum of hoursPlayed for all consoles
//     const hoursSum = consoleList.reduce((total, console) => {
//       return total + console.games.reduce((gameTotal, game) => {
//         return gameTotal + game.hoursPlayed;
//       }, 0);
//     }, 0);
    
//     res.render("console/index", {
//       consoleList: consoleList,
//       priceSum: priceSum,
//       hoursSum: hoursSum
//     });
//   } catch (e) {
//     console.log(e);
//   }
// });

// displaying consoles added by user and total money & time spent on games
router.get("/", secureUser, async (req, res) => {
  try {
    // Retrieve console items added by the current user
    const consoleList = await ConsoleModel.find({ createdBy: req.user._id });

    // calculate the sum of gamePrice for all consoles
    const priceSum = consoleList.reduce((total, console) => {
      return total + console.games.reduce((gameTotal, game) => {
        return gameTotal + game.gamePrice;
      }, 0);
    }, 0);


    // calculate the sum of hoursPlayed for all consoles
    const hoursSum = consoleList.reduce((total, console) => {
      return total + console.games.reduce((gameTotal, game) => {
        return gameTotal + game.hoursPlayed;
      }, 0);
    }, 0);
    
    res.render("console/index", {
      consoleList: consoleList,
      priceSum: priceSum,
      hoursSum: hoursSum
    });
  } catch (e) {
    console.log(e);
  }
});


// displaying games added to each console
router.get('/console/:id/details', secureUser, async (req, res) => {
  try {
      const consoleItem = await ConsoleModel.findById(req.params.id);

      const searchQuery = req.query.gameName;
      let games = consoleItem.games;

      if (searchQuery && searchQuery.trim() !== '') {
          // filter games based on the search query
          games = games.filter(game => game.gameName.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      res.render('console/showGames', { consoleItem: consoleItem, games: games, searchQuery: searchQuery });
  } catch (e) {
      console.log(e);
  }
});


// adding consoles to main page
router.get("/add_console", secureUser, (req,res) =>{
    res.render('console/addConsole')
})


router.post("/add_console", secureUser, upload.single("consolePicture"), async (req,res) => {
    try{
        const consoleInfo = new ConsoleModel({
          ...req.body,
          createdBy: req.user._id,
          consolePicture: req.file.filename
        })
        await consoleInfo.save()
        res.redirect('/')
    }catch (e) {
        console.log(e)
        res.redirect('/add_console')
    }
})

// amris code
// router.post(
//   "/entryList/create", [secureUser, upload.single("entryImage")],
//   async (req, res) => {
//     console.log(req.user);
//     try {
//       const entry = new Entry({
//         ...req.body,
//         entryImage: req.file.filename,
//         createdBy: req.user._id,
//       });
//       await entry.save();
//       res.redirect("/");
//     } catch (e) {
//       console.log(e);
//     }
//   }
// );


// Adding games to individual consoles
router.get("/games/:id/add", secureUser, (req,res) => {
    res.render('console/addGame', {consoleId: req.params.id})
})

router.post('/games/:id/add', async (req, res) => {
    try {
        // converting the on/off value from checkbox to true/false
        req.body.isCompleted = Boolean(req.body.isCompleted);
  
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

//deleting consoles
router.delete("/console/:id/details", secureUser, async (req, res) => {
  try {
    const consoleId = req.params.id;
    
    // Find the console by ID and check if it belongs to the logged-in user
    const consoleInfo = await ConsoleModel.findOne({
      _id: consoleId,
      createdBy: req.user._id
    });

    if (!consoleInfo) {
      // Console not found or doesn't belong to the user
      return res.status(404).json({ error: "Console not found" });
    }

    // Delete the console
    await ConsoleModel.findByIdAndDelete(consoleId);

    // Redirect or send a success response
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

  
  
router.post("/entryList/create", [secureUser, upload.single("entryImage")],
async (req, res) => {
  console.log(req.user);
  try {
    const entry = new Entry({
      ...req.body,
      entryImage: req.file.filename,
      createdBy: req.user._id,
    });
    await entry.save();
    res.redirect("/");
  } catch (e) {
    console.log(e);
  }
}
);
  

// Editing games inside console
router.get("/console/:consoleid/games/:id/update", secureUser, async (req,res) =>{
    const games = await ConsoleModel.findOne({'games._id': req.params.id}, {"games.$": 1})
    consoleId = req.params.consoleid

    const game = games.games[0]
    // console.log(DateTime.fromJSDate(game.dateBoughtGame).toFormat("yyyy-MM-dd"))
    res.render("console/updateGame",{ games: {

      dateBoughtGame: DateTime.fromJSDate(game.dateBoughtGame).toFormat("yyyy-MM-dd"),
      gameName: game.gameName,
      gamePrice: game.gamePrice,
      isCompleted: game.isCompleted,
      hoursPlayed: game.hoursPlayed,
      
    }, game, consoleId
  })
})


router.put("/console/:consoleid/games/:id/update", async (req, res) => {
  try {
    // converting the on/off value from checkbox to true/false
    req.body.isCompleted = Boolean(req.body.isCompleted);
    
    const consoleId = req.params.consoleid;
    const gameId = req.params.id;
    const updatedGame = req.body;

    // find console by id
    const console = await ConsoleModel.findById(consoleId);

    if (!console) {
      return res.send("Console not found");
    }

    // Find the game within the console's games array by its ID
    const game = console.games.id(gameId);

    if (!game) {
      return res.send("Game not found");
    }

    // updating game details
    game.gameName = updatedGame.gameName;
    game.dateBoughtGame = updatedGame.dateBoughtGame;
    game.gamePrice = updatedGame.gamePrice;
    game.isCompleted = updatedGame.isCompleted;
    game.hoursPlayed = updatedGame.hoursPlayed;


    await console.save();
    res.redirect('/');
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});




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
      res.redirect("/")
  
    } catch (e) {
      console.error(e);

    }
  });
  

module.exports = router
