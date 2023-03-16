const axios = require('axios');
const moment = require('moment');
const Bottleneck = require('bottleneck');
const API_KEY = 'AIzaSyDF_BFvQdsZ6IQQkkQyHXuv4CGcZwbnzDI';

// Limit the number of concurrent requests to 1
const limiter = new Bottleneck({
	maxConcurrent: 5,
	minTime: 1500,
});

const userAgents = [
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/88.0.705.74 Safari/537.36',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:85.0) Gecko/20100101 Firefox/85.0',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36 Edg/90.0.818.39',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.78',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36 OPR/74.0.3911.218',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36 Edg/86.0.622.51',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36 Edg/89.0.774.45',
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.51',
];

const getRandomUserAgent = () => {
	const index = Math.floor(Math.random() * userAgents.length);
	return userAgents[index];
};

const findCreatorType = (followers) => {
	// mega, macro, micro, nano
	if (followers >= 1000000) {
		return 'mega';
	} else if (followers >= 100000) {
		return 'macro';
	} else if (followers >= 10000) {
		return 'micro';
	} else {
		return 'nano';
	}
};

const uuidGenerator = () => {
	const timestamp = Date.now().toString(36);
	const randomStr = Math.random().toString(36).substr(2, 5);
	return `${timestamp}-${randomStr}`;
};

const youtubeVideo = async (short_code) => {
	const VIDEO_URL = `https://www.googleapis.com/youtube/v3/videos?id=${short_code}&key=${API_KEY}
     &part= snippet, statistics, contentDetails, status`;
	const response = await axios.get(VIDEO_URL);
	const { data } = response;
	if (response.status === 200 && data.items.length > 0) {
		const { items } = data;
		const videoDetails = items[0];
		const { snippet, statistics, contentDetails, status } = videoDetails;
		const { title, channelTitle, channelId, thumbnails } = snippet;
		const { viewCount, likeCount, commentCount } = statistics;
		const { duration } = contentDetails;
		const { privacyStatus } = status;

		const CHANNEL_URL = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${channelId}&key=${API_KEY}`;
		const channelResponse = await axios.get(CHANNEL_URL);
		const channelData = channelResponse.data;

		const subscribers = channelData?.items[0]?.statistics?.subscriberCount;

		const engagement_rate =
			((parseInt(likeCount) + parseInt(commentCount)) / parseInt(subscribers)) *
			100;

		const profile_image =
			channelData?.items[0]?.snippet?.thumbnails?.default?.url;
		return {
			uuid: uuidGenerator(),
			live_url: `https://www.youtube.com/watch?v=${short_code}`,
			title: title,
			name: channelTitle,
			username: channelId,
			thumbnail: thumbnails.medium.url,
			status: privacyStatus,
			statistics: {
				views: viewCount,
				likes: likeCount,
				comments: commentCount,
				engagement_rate: engagement_rate.toFixed(2),
			},
			durationInMinutes: Math.round(moment.duration(duration).asMinutes()),
			profile_image: profile_image,
			channel_url: `https://www.youtube.com/channel/${channelId}`,
			profile_url: `https://www.youtube.com/channel/${channelId}`,
			subscribers: subscribers,
			creator_type: findCreatorType(subscribers),
			platform: 'youtube',
			user: {
				name: channelTitle,
				username: channelId,
				profile_image: profile_image,
				channelId: channelId,
				statistics: {
					subscribers: channelData?.items[0]?.statistics?.subscriberCount,
					views: channelData?.items[0]?.statistics?.viewCount,
					videos: channelData?.items[0]?.statistics?.videoCount,
				},
			},
			extras: videoDetails,
		};
	} else {
		return null;
	}
};

const instagramPost = async (short_code) => {
	const response = await axios
		.get(
			`https://instagram-scraper-2022.p.rapidapi.com/ig/post_info/?shortcode=${short_code}`,
			{
				headers: {
					'X-RapidAPI-Key':
						'20bdab00a9mshc812974baf6a3c1p1e856fjsnf8c110d2dd61',
					'X-RapidAPI-Host': 'instagram-scraper-2022.p.rapidapi.com',
				},
			}
		)
		.catch((err) => {
			console.log(err);
		});

	if (response.status === 200) {
		const { data } = response;

		const image = await axios.get(data.owner.profile_pic_url, {
			responseType: 'arraybuffer',
		});
		const base64Image = Buffer.from(image.data, 'binary').toString('base64');

		const {
			shortcode,
			edge_media_to_comment,
			edge_media_preview_like,
			video_view_count,
			video_play_count,
			owner,
		} = data;
		console.log(data);
		const { username, profile_pic_url, full_name } = owner;

		const followers = parseInt(owner.edge_followed_by.count);
		const likes = parseInt(edge_media_preview_like.count);
		const comments = parseInt(edge_media_to_comment.count);

		const engagement_rate = ((likes + comments) / followers) * 100;
		return {
			uuid: uuidGenerator(),
			live_url: `https://www.instagram.com/p/${shortcode}`,
			name: full_name,
			username: username,
			profilePic: profile_pic_url,
			base64ProfilePic: base64Image,
			views: video_view_count,
			likes: edge_media_preview_like.count,
			comments: edge_media_to_comment.count,
			playCount: video_play_count,
			viewCount: video_view_count,
			profile_image: profile_pic_url,
			profile_url: `https://www.instagram.com/${username}`,
			statistics: {
				views: video_view_count,
				likes: edge_media_preview_like.count,
				comments: edge_media_to_comment.count,
				engagement_rate: engagement_rate.toFixed(2),
			},
			play_count: video_play_count,
			followers: owner.edge_followed_by.count,
			creator_type: findCreatorType(followers),
			platform: 'instagram',
			posts: owner.edge_owner_to_timeline_media.count,
			user: owner,
			extras: data,
		};
	} else {
		return null;
	}
};

exports.getInsights = async (req, res) => {
	try {
		const { youtubeShortCodes, instagramShortCodes } = req.body;
		let igResult = [];
		let ytResult = [];
		if (youtubeShortCodes && youtubeShortCodes?.length > 0) {
			const youtubeInsights = await Promise.allSettled(
				youtubeShortCodes.map(async (short_code) => {
					const response = await youtubeVideo(short_code);
					return response;
				})
			);

			ytResult = youtubeInsights.map((item) => {
				if (item.status === 'fulfilled') {
					return item.value;
				} else {
					return null;
				}
			});
		}

		if (instagramShortCodes && instagramShortCodes?.length > 0) {
			const instagramPromises = instagramShortCodes.map((short_code) => {
				return limiter.schedule(async () => {
					const response = await instagramPost(short_code);
					return response;
				});
			});

			const instagramInsights = await Promise.allSettled(instagramPromises);

			igResult = instagramInsights.map((item) => {
				if (item.status === 'fulfilled') {
					return item.value;
				} else {
					return null;
				}
			});
		}

		res.status(200).json({
			youtube: ytResult,
			instagram: igResult,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			errors: {
				code: 500,
				message: error.message,
			},
		});
	}
};

exports.instagramProfile = async (req, res) => {
	// get username from query
	const { usernames } = req.body;
	if (!usernames) {
		return res.status(400).json({
			errors: {
				code: 400,
				message: 'Please provide username',
			},
		});
	}

	try {
		const getProfile = async (username) => {
			const BASE_URL = `https://api.cloudsuper.link/sosmed/v1/analytics?username=${username}&mediaType=INSTAGRAM`;
			const headerParams = {
				'User-Agent': getRandomUserAgent(),
				Host: 'api.cloudsuper.link',
				Origin: 'https://mez.ink',
				Referer: 'https://mez.ink/',
				authorization: 'Bearer',
				timestamp: new Date().getTime(),
			};

			const response = await axios.get(BASE_URL, {
				headers: headerParams,
			});

			if (response.status === 200) {
				const { data } = response;
				return {
					...data,
				};
			} else {
				return null;
			}
		};

		// use limiter to avoid rate limit error
		const promises = usernames.map((username) => {
			return limiter.schedule(async () => {
				const response = await getProfile(username);
				return response;
			});
		});

		const result = await Promise.allSettled(promises);

		const finalResult = result.map((item) => {
			if (item.status === 'fulfilled') {
				return item.value.data;
			} else {
				return null;
			}
		});

		res.status(200).json({
			data: finalResult,
		});
	} catch (error) {
		res.status(500).json({
			errors: {
				code: 500,
				message: error.message,
			},
		});
	}
};

exports.youtubeProfile = async (req, res) => {
	// use mez.ink api to get youtube profile
	const { usernames } = req.body;

	if (!usernames || usernames.length === 0) {
		return res.status(400).json({
			errors: {
				code: 400,
				message: 'Please provide username',
			},
		});
	}

	try {
		const getProfile = async (username) => {
			const BASE_URL = `https://api.cloudsuper.link/sosmed/v1/analytics?username=${username}&mediaType=YOUTUBE`;

			const headerParams = {
				'User-Agent': getRandomUserAgent(),
				Host: 'api.cloudsuper.link',
				Origin: 'https://mez.ink',
				Referer: 'https://mez.ink/',
				authorization: 'Bearer',
				timestamp: new Date().getTime(),
			};

			const response = await axios.get(BASE_URL, {
				headers: headerParams,
			});

			if (response.status === 200) {
				const { data } = response;
				return {
					...data,
				};
			} else {
				return null;
			}
		};

		// use limiter to avoid rate limit error
		const promises = usernames.map((username) => {
			return limiter.schedule(async () => {
				const response = await getProfile(username);
				return response;
			});
		});

		const result = await Promise.allSettled(promises);

		const finalResult = result.map((item) => {
			if (item.status === 'fulfilled') {
				return item.value.data;
			} else {
				return null;
			}
		});

		res.status(200).json({
			data: finalResult,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			errors: {
				code: 500,
				message: error.message,
			},
		});
	}
};

exports.getReportInsights = async (req, res) => {
	try {
		const { youtubeShortCodes, instagramShortCodes } = req.body;

		let igResult = [];
		let ytResult = [];
		if (youtubeShortCodes && youtubeShortCodes?.length > 0) {
			const youtubeInsights = await Promise.allSettled(
				youtubeShortCodes.map(async (short_code) => {
					const response = await youtubeVideo(short_code);
					return response;
				})
			);

			ytResult = youtubeInsights.map((item) => {
				if (item.status === 'fulfilled') {
					return item.value;
				} else {
					return null;
				}
			});
		}

		if (instagramShortCodes && instagramShortCodes?.length > 0) {
			const instagramPromises = instagramShortCodes.map((short_code) => {
				return limiter.schedule(async () => {
					const response = await instagramPost(short_code);
					return response;
				});
			});

			const instagramInsights = await Promise.allSettled(instagramPromises);

			igResult = instagramInsights.map((item) => {
				if (item.status === 'fulfilled') {
					return item.value;
				} else {
					return null;
				}
			});
		}

		res.status(200).json({
			youtube: ytResult,
			instagram: igResult,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			errors: {
				code: 500,
				message: error.message,
			},
		});
	}
};
