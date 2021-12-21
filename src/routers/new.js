const express = require('express')
const New = require('../models/new')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')


//to insert 
router.post('/news', auth, async(req, res) => {
    try {
        const news = new New({...req.body, owner: req.reporter._id })
        await news.save()
        res.status(200).send(news)
    } catch (e) {
        res.status(400).send(e.message)

    }
})


//to insert image
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

router.post('/avatar/:id', auth, uploads.single('avatar'), async(req, res) => {
    try {
        const _id = req.params.id
        const news = await New.findOne({ _id, owner: req.reporter._id })
        news.avatar = req.file.buffer
        await news.save()
        res.status(200).send()
    } catch (e) { res.status(400).send(e.message) }
})

//to display all news to same reporter 
router.get('/news', auth, async(req, res) => {
    try {
        await req.reporter.populate('new')
        res.send(req.reporter.new)
    } catch (e) {
        res.send(e.message)
    }
})

//to display one doc
router.get('/news/:id', auth, async(req, res) => {
    try {
        const _id = req.params.id
        const news = await New.findOne({ _id, owner: req.reporter._id })
        if (!news) {
            return res.status(404).send("can't find this new")
        }
        res.status(200).send(news)
    } catch (e) { res.status(500).send(e.message) }
})

//reporter update on his news
router.patch('/news/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description']
    let isValid = updates.every((el) => allowedUpdates.includes(el))
    if (!isValid) {
        return res.status(400).send("can't update")
    }
    try {
        const _id = req.params.id
        const news = await New.findOne({ _id, owner: req.reporter._id })

        if (!news) {
            return res.status(404).send('no news')
        }
        updates.forEach((update) => news[update] = req.body[update])
        await news.save()
        res.status(200).send(news)
    } catch (e) { res.status(500).send(e.message) }
})

//reporter delete only his new  
router.delete('/news/:id', auth, async(req, res) => {
    try {
        const _id = req.params.id
        const news = await New.findOneAndDelete({ _id, owner: req.reporter._id })
        if (!news) {
            return res.status(404).send('not found')
        }
        res.status(200).send(news)

    } catch (e) { res.status(500).send(e.message) }
})
module.exports = router