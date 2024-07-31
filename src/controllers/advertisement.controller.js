import { Op } from 'sequelize';
import { bodyReqFields } from "../utils/requiredFields.js"
import { Advertisement } from "../models/advertisement.model.js";
import { frontError, catchError, successOk, validationError, successOkWithData } from "../utils/responses.js";
import { convertToLowercase, validateEmail, validatePhone } from '../utils/utils.js';

// =============================================================
//                           Helping function
// =============================================================

// Helper function to validate YouTube URLs
const validateYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(channel\/|user\/|playlist\/|watch\?v=|embed\/|v\/)?|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
    return youtubeRegex.test(url);
};

// Helper function to validate Instagram URLs
const validateInstagramUrl = (url) => {
    const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/;
    return instagramRegex.test(url);
};

// Helper function to validate Spotify URLs
const validateSpotifyUrl = (url) => {
    const spotifyRegex = /^(https?:\/\/)?(www\.)?spotify\.com\/(track|album|playlist|artist)\/[a-zA-Z0-9]{22}$/;
    return spotifyRegex.test(url);
};

// ========================= getAdvertisement ===========================

export async function getAdvertisement(req, res) {
    try {
        console.log(" ===== getAdvertisement ===== ")
        console.log(" ===== getAdvertisement ===== ")
        console.log(" ===== getAdvertisement ===== ")


        const reqData = convertToLowercase(req.query)

        const { title, category } = reqData

        let filters = {}

        if (title) {
            filters.title = {
                [Op.like]: `%${title}%`
            };
        }
        if (category) {
            filters.category = category
        }

        const advertisement = await Advertisement.findAll({
            where: filters,
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        });

        return successOkWithData(res, "Advertisements Fetched Successfully", advertisement)
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= createAdvertisement ===========================

export async function createAdvertisement(req, res) {
    try {
        console.log(" ===== createAd ===== ")
        console.log(" ===== createAd ===== ")
        console.log(" ===== createAd ===== ")

        const reqBodyFields = bodyReqFields(req, res, [
            "title",
            "description",
            "category",
            "youtubeUrl",
            "instagramUrl",
            "spotifyUrl",
            "paid"
        ]);

        if (reqBodyFields.error) return reqBodyFields.resData;

        const reqData = convertToLowercase(req.body, ['youtubeUrl', 'instagramUrl', 'spotifyUrl', 'image'])
        const {
            title,
            description,
            category,
            youtubeUrl,
            instagramUrl,
            spotifyUrl,
            paid
        } = reqData;

        // Check if a file was uploaded
        if (!req.file) {
            return frontError(res, 'this is required', "image")
        }

        if (youtubeUrl && !validateYouTubeUrl(youtubeUrl)) {
            return validationError(res, 'Invalid YouTube URL.', "youtubeUrl")
        }

        if (instagramUrl && !validateInstagramUrl(instagramUrl)) {
            return validationError(res, 'Invalid Instagram URL.', "instagramUrl")
        }

        // if (spotifyUrl && !validateSpotifyUrl(spotifyUrl)) {
        //     return validationError(res, 'Invalid Spotify URL.', "spotifyUrl")
        // }

        const advertisementImagePath = req.file.path;

        const advertisementData = {
            title,
            description,
            category,
            youtube_url: youtubeUrl,
            instagram_url: instagramUrl,
            spotify_url: spotifyUrl,
            image: advertisementImagePath,
            paid: paid || false
        }

        console.log("advertisementData ============ \n", advertisementData)

        const advertisementCreated = await Advertisement.create(advertisementData)

        console.log("advertisementCreated ============ \n", advertisementCreated)

        return successOk(res, "Advertisement created Successfully")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= updateAdvertisement ===========================

export async function updateAdvertisement(req, res) {
    try {
        const { uuid } = req.query
        if (!uuid) {
            return frontError(res, 'this is required', 'uuid');
        }

        const advertisement = await Advertisement.findOne({
            where: { uuid }
        });
        if (!advertisement) {
            return frontError(res, 'Invalid uuid, No advertisement Found', 'uuid');
        }

        const reqData = convertToLowercase(req.body, ['youtubeUrl', 'instagramUrl', 'spotifyUrl', 'image'])

        const {
            title,
            description,
            category,
            youtubeUrl,
            instagramUrl,
            spotifyUrl,
            paid
        } = reqData;

        if (youtubeUrl && !validateYouTubeUrl(youtubeUrl)) {
            return validationError(res, 'Invalid YouTube URL.', "youtubeUrl")
        }

        if (instagramUrl && !validateInstagramUrl(instagramUrl)) {
            return validationError(res, 'Invalid Instagram URL.', "instagramUrl")
        }

        // if (spotifyUrl && !validateSpotifyUrl(spotifyUrl)) {
        //     return validationError(res, 'Invalid Spotify URL.', "spotifyUrl")
        // }

        const advertisementData = {
            title,
            description,
            category,
            youtube_url: youtubeUrl,
            instagram_url: instagramUrl,
            spotify_url: spotifyUrl,
            paid
        }

        if (req.file) {
            advertisementData.image = req.file.path;
        }

        await Advertisement.update(advertisementData, { where: { uuid } });

        return successOk(res, "Advertisement Updated Successfully")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}

// ========================= deleteAdvertisement ===========================

export async function deleteAdvertisement(req, res) {
    try {
        const { uuid } = req.query
        if (!uuid) {
            return frontError(res, 'this is required', 'uuid');
        }
        const advertisement = await Advertisement.findOne({ where: { uuid } });
        if (!advertisement) {
            return frontError(res, 'invalid uuid', 'uuid');
        }

        await advertisement.destroy();
        return successOk(res, "Advertisement Deleted Successfully")
    } catch (error) {
        console.log(error)
        catchError(res, error);
    }
}