# Getting Started

#### Installtion

	git clone 'PATH_TO_REPO'
	cd 'PATH_TO_REPO'
	npm install

#### Create a database

	CREATE DATABASE database_name;

#### Create  a table 

	CREATE TABLE `insta-backend`.`users` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`instaUserId` VARCHAR(45) NULL,
	`facebookUserId` VARCHAR(45) NULL,
	`username` VARCHAR(45) NULL,
	`sessionId` VARCHAR(45) NULL,
	`accesstoken` VARCHAR(255) NULL,
	PRIMARY KEY (`id`));


# API Routes 

## Instagram

1. #### Instagram Intelligence
	#### Type : 
	POST
	#### Description 
	This request will return a array of instagram profile. Here we are using instagram profile url as an input

	    http://localhost:8000/api/instagram/

2. #### Instagram analytics
	#### Type : 
	POST
	#### Description 
	This request will return a array of instagram post analytics. Here we are using facebook token as an input. 
		
		    http://localhost:8000/api/instagram/analytics


## Youtube

1. #### Channel Analytics
	#### Type : 
	POST
	
	http://localhost:8000/api/youtube/channel

	#### Input : 

```
	{
		"channelList": [
			"https://www.youtube.com/c/PrafullMBACHAIWALA"
		]
	}
```

2. #### Video analytics
	#### Type : 
	
	POST
    
	http://localhost:8000/api/youtube/video

	#### Input :

```
	{
		"videosList" :[
			"https://youtu.be/Xi4oVKAlCdE",
			"https://youtu.be/gAyunHqNFx0",
			"https://youtu.be/tv-IOL_NOLk",
			"https://youtu.be/l3qvbo6jDuI"
		]
	}
```

		    
## Users
1. #### Get Users
	#### Type : 
	GET
	#### Description 
	
	This API will get all users from the database.

	    http://localhost:8000/api/user

2. ### GET : User By Id
	#### Get Users by Id
	#### Type : 
	GET
	#### Description 

	This API will get user by id. It will take request param as an id value
	
	    http://localhost:8000/api/user/:id

	##### Path Variable

	| id | 1 |
	|--|--|

3. #### Register User
	#### Type : 
	GET
	#### Description 

	For Register a new user we will use this API.

	    http://localhost:8000/api/user
	##### BODY raw

	    {
		    "instaUserId": "11110000",
   			"facebookUserId":"11110000",
			"instaUsername":"test",
			"facebookUsername": "test",
			"sessionId": "bjdobjpdovbjpovbjp",
			"accesstoken": "odjsdfj0rfjr0r9jc0jcf09j"
	    }
