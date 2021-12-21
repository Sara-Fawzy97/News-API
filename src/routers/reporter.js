const express = require('express')
const router = new express.Router()
const Reporter = require('../models/reporter')
const auth = require('../middleware/auth')
const multer = require('multer')

//to sign up
router.post('/reporter', async(req, res) => {
    try {
        const reporter = new Reporter(req.body)
        const token = await reporter.generateToken()
        await reporter.save()
        res.status(200).send({ reporter, token })
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//login
router.post('/login', async(req, res) => {
    try {
        const reporter = await Reporter.findByCredentials(req.body.email, req.body.password)
        const token = await reporter.generateToken()
        res.status(200).send({ reporter, token })

    } catch (e) {
        res.status(500).send(e.message)
    }

})

//to get all reporters
router.get('/reporters', auth, async(req, res) => {
    try {
        const reporter = await Reporter.find({})
        res.status(200).send(reporter)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

//to get one document by id
router.get('/reporters/:id', auth, async(req, res) => {
    try {
        const _id = req.params.id
        const reporter = await Reporter.findById(_id)
        if (!reporter) {
            res.status(404).send("Unable to find this reporter")
        }
        res.status(200).send(reporter)
    } catch (e) {
        res.status(500).send(e.message)
    }

})

router.get('/profile', auth, (req, res) => {
    res.send(req.user)
})

//to logout and delete one token
router.delete('/logout', auth, async(req, res) => {
    try {
        req.reporter.tokens = req.reporter.tokens.filter((el) => {
            return el !== req.token
        })
        await req.reporter.save()
        res.status(200).send("Logout successfully")

    } catch (e) {
        res.status(500).send(e.message)
    }

})

//to logout all by deleting all tokens
router.delete('/logoutall', auth, async(req, res) => {
    try {
        req.reporter.tokens = []
        await req.reporter.save()
        res.status(200).send('Logout all successfully')
    } catch (e) {
        res.status(500).send(e.message)
    }
})

//to update -> find the doc then upda
router.patch('/update/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'password', 'phone']

    let isValid = updates.every((el) => allowedUpdates.includes(el))
    if (!isValid) {
        res.status(400).send("Can't Update")
    }
    try {
        const _id = req.params.id
        const reporter = await Reporter.findById(_id)
        if (!reporter) {
            res.status(400).send("Can't find this reporter")
        }
        updates.forEach((el) => (reporter[el] = req.body[el]))
        await reporter.save()
        res.status(200).send(reporter)

    } catch (e) {
        res.status(404).send(e.message)
    }
})

//to insert profile image
const uploads = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)) {
            cb(new Error("please upload image"))
        }
        cb(null, true)
    }
})

router.post('/profile/avatar', auth, uploads.single('avatar'), async(req, res) => {
    try {
        req.reporter.avatar = req.file.buffer
        await req.reporter.save()
        res.status(200).send()
    } catch (e) { res.status(400).send(e.message) }
})
module.exports = router