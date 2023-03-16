const axios = require('axios');
const cheerio = require('cheerio');

const API_KEY = 'AIzaSyDF_BFvQdsZ6IQQkkQyHXuv4CGcZwbnzDI';

// const API_KEY = 'AIzaSyCtH5knOdmZ53AaUPeUgR_hYNFdsBRVT7E';
const getChannelDetails = async (CHANNEL_ID) => {
	const CHANNEL_URL = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&fields=*&id=${CHANNEL_ID}&key=${API_KEY}`;

	const { data } = await axios.get(CHANNEL_URL);
	const channel = data.items.map((item) => {
		return {
			channelUrl: `https://www.youtube.com/channel/${item.id}`,
			title: item.snippet.title,
			description: item.snippet.description,
			subscribers: item.statistics.subscriberCount,
			id: item.id,
			viewCount: item.statistics.viewCount,
			videoCount: item.statistics.videoCount,
			commentCount: item.statistics.commentCount,
			subscriberCount: item.statistics.subscriberCount,
			hiddenSubscriberCount: item.statistics.hiddenSubscriberCount,
		};
	});

	return channel;
};

const getVideoDetails = async (VIDEO_ID) => {
	const VIDEO_URL = `https://www.googleapis.com/youtube/v3/videos?id=${VIDEO_ID}&key=${API_KEY}
     &part= snippet, statistics, contentDetails, status`;
	const { data } = await axios.get(VIDEO_URL);

	const videoDetails = data.items.map((item) => {
		if (
			item.contentDetails.duration.match(/PT(\d+)M/) &&
			item.snippet.liveBroadcastContent === 'none'
		) {
			return item;
		} else {
			return null;
		}
	});

	const last15Videos = videoDetails.filter((item) => item !== null).slice(-15);

	return last15Videos.map((item) => {
		return {
			videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
			title: item.snippet.title,
			channelTitle: item.snippet.channelTitle,
			channelId: item.snippet.channelId,
			thumbnail: item.snippet.thumbnails.medium.url,
			status: item.status.privacyStatus,
			categoryId: item.snippet.categoryId,
			views: item.statistics.viewCount,
			likes: item.statistics.likeCount,
			comments: item.statistics.commentCount,
			durationInMinutes: item.contentDetails.duration.match(/PT(\d+)M/)[1],
			publishedAt: item.snippet.publishedAt,
		};
	});

	// return data.items.map((item) => {
	// 	return {
	// 		videoUrl: `https://www.youtube.com/watch?v=${item.id}`,
	// 		videoId: item.id,
	// 		title: item.snippet.title,
	// 		channelTitle: item.snippet.channelTitle,
	// 		categoryId: item.snippet.categoryId,
	// 		publishedAt: item.snippet.publishedAt,
	// 		views: item.statistics.viewCount,
	// 		likes: item.statistics.likeCount,
	// 		dislikes: item.statistics.dislikeCount,
	// 		favorites: item.statistics.favoriteCount,
	// 		comments: item.statistics.commentCount,
	// 		duration: item.contentDetails.duration,
	// 	};
	// });
};

const getChannelId = async (url) => {
	const checkUrl = (url) =>
		url.indexOf('youtube.com') !== -1 || url.indexOf('youtu.be') !== -1;
	if (checkUrl(url)) {
		const ytChannelPageResponse = await axios.get(url);
		const $ = cheerio.load(ytChannelPageResponse.data);

		const id = $('meta[itemprop="channelId"]').attr('content');
		console.log(id);
		return id;
	} else {
		throw Error(`"${url}" is not a YouTube url.`);
	}

	throw Error(`Unable to get "${url}" channel id.`);
};

const getVideoList = async (channelId, videoCount) => {
	const VIDEO_URL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${videoCount}`;
	const { data } = await axios.get(VIDEO_URL);
	const id = data.items.map((item) => {
		return item.id.videoId;
	});
	return id;
};

const getBestPerfomingVideo = async (channelId, maxCount) => {
	const URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&key=${API_KEY}&maxResults=${maxCount}&order=viewcount`;

	const { data } = await axios.get(URL);
	const videoId = data.items.map((item) => {
		return item.id.videoId;
	});
	return videoId;
};

const getAverageViews = async (videoDetails) => {
	const totalViews = videoDetails.reduce((acc, curr) => {
		return acc + parseInt(curr.views);
	}, 0);

	const averageViews = totalViews / videoDetails.length;

	return averageViews.toFixed(3);
};

const getAvevrageLikes = async (videoDetails) => {
	const totalLikes = videoDetails.reduce((acc, curr) => {
		return acc + parseInt(curr.likes);
	}, 0);

	const averageLikes = totalLikes / videoDetails.length;

	return averageLikes.toFixed(3);
};

const getAverageComments = async (videoDetails) => {
	const totalComments = videoDetails.reduce((acc, curr) => {
		return acc + parseInt(curr.comments);
	}, 0);

	const averageComments = totalComments / videoDetails.length;

	return averageComments.toFixed(3);
};

const getEngagementRate = async (videoDetails, subscriberCount) => {
	const averageViews = await getAverageViews(videoDetails);
	const engagementRate =
		(parseFloat(averageViews) / parseFloat(subscriberCount)) * 100;
	return engagementRate.toFixed(3);
};

module.exports = {
	getChannelDetails,
	getVideoDetails,
	getChannelId,
	getVideoList,
	getBestPerfomingVideo,
	getAverageViews,
	getAvevrageLikes,
	getAverageComments,
	getEngagementRate,
};
