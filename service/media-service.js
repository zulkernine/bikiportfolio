const { dynamodb, Util } = require("./aws-service");
const config = require("../config.json");
const { v4: uuidv4 } = require("uuid");

class MediaService {
    static async getAllImages(accountId,shuffle = false) {
        const allImages = await getAllDynamoImages(accountId);
        // add filters
        for (let i = 0; i < allImages.length; i++) {
            switch (allImages[i].tag) {
                case "WEDDING":
                case "PRE_WEDDING":
                    {
                        allImages[i].filter = "wedding";
                    }
                    break;
                case "ONE_DAY_EVENTS":
                case "BIRTH_DAY":
                    {
                        allImages[i].filter = "birthday";
                    }
                    break;
                case "CELEBRITY":
                    {
                        allImages[i].filter = "models";
                    }
                    break;
                case "OTHERS":
                    {
                        allImages[i].filter = "others";
                    }
                    break;
            }
        }

        if (shuffle) allImages.sort((a, b) => a.id > b.id);
        else allImages.sort((a, b) => b.uploadedAt - a.uploadedAt);
        return allImages;
    }

    static async getAlboutInfo(accountId) {
        const params = {
            TableName: config.aboutTable,
            Key: {
                accountId,
            },
        };
        const infos = await scanDynamoTable(params, []);
        return infos.length ? infos[0] : null;
    }

    static async getRecentImages(accountId) {
        const allImages = (await getAllDynamoImages(accountId)).filter(
            (img) => img["isRecent"]
        );
        allImages.sort((a, b) => b.uploadedAt - a.uploadedAt);
        return allImages;
    }

    static async getAllVideos(accountId) {
        const allVideos = await getAllDynamoVideos(accountId);
        allVideos.sort((a, b) => b.uploadedAt - a.uploadedAt);
        return allVideos;
    }

    static async getRecentVideos(accountId) {
        const allVideos = (await getAllDynamoVideos(accountId)).filter(
            (vid) => vid.isRecent
        );
        allVideos.sort((a, b) => b.uploadedAt - a.uploadedAt);
        return allVideos;
    }

    static async getAllTeamMembers(accountId) {
        const members = await getAllTeamMembers(accountId);
        members.sort((a, b) => a.serialNo - b.serialNo);
        return members;
    }

    static async findById(table, id) {
        const params = {
            TableName: table,
            Key: {
                id: id,
            },
        };
        const infos = await scanDynamoTable(params, []);
        return infos.length ? infos[0] : null;
    }

    static async getTeamInfo(accountId) {
        console.log("accountId: " + accountId);
        const params = {
            TableName: config.adminUserTable,
            Key: {
                accountId,
            },
        };
        const infos = await scanDynamoTable(params, []);
        return infos.find((v, i) => v.accountId == accountId);
    }

    static async getTeamInfoByUsername(username) {
        console.log("username: " + username);
        const params = {
            TableName: config.adminUserTable,
            Key: {
                id: username,
            },
        };
        const infos = await scanDynamoTable(params, []);
        console.log(infos);
        return infos.find((v, i) => v.email == username);
    }

    static async getHomePageInfo(accountId) {
        const params = {
            TableName: config.homeTable,
            Key: {
                accountId,
            },
        };
        const infos = await scanDynamoTable(params, []);
        return infos.find((v, i) => v.accountId == accountId);
    }

    static async getServices(accountId) {
        const params = {
            TableName: config.serviceQuotes,
            FilterExpression: "accountId = :val",
            ExpressionAttributeValues: {
                ":val": accountId,
            },
        };
        return (await scanDynamoTable(params, [])).map((e) => {
            return {
                url: e.iconUrl,
                id: e.id,
                ...JSON.parse(e.detailsJson),
            };
        });
    }

    static async getTeamMembers(accountId) {
        const params = {
            TableName: config.teamTable,
            FilterExpression: "accountId = :val",
            ExpressionAttributeValues: {
                ":val": accountId,
            },
        };
        return await scanDynamoTable(params, []);
    }

    static async getContactDetails(accountId) {
        console.log("accountId: " + accountId);
        const params = {
            TableName: config.contactDetails,
            Key: {
                accountId,
            },
        };
        const infos = await scanDynamoTable(params, []);
        return infos.find((v, i) => v.accountId == accountId);
    }

    static async addClientQuery(accountId, data) {
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        };

        const params = {
            TableName: config.clientQuery,
            Item: {
                id: uuidv4(),
                accountId: accountId,
                name: data.txtName,
                email: data.txtEmail,
                phone: data.txtPhone,
                message: data.txtMsg,
                uploadedAt: new Date().toLocaleDateString("en-US", options),
            },
        };

        await dynamodb.put(params).promise();
    }

    static async getClientQueries(accountId) {
        const params = {
            TableName: config.clientQuery,
            FilterExpression: "accountId = :val",
            ExpressionAttributeValues: {
                ":val": accountId,
            },
        };
        return await scanDynamoTable(params, []);
    }
}

module.exports = MediaService;

async function getAllDynamoImages(accountId) {
    const params = {
        TableName: config.imageTable,
        FilterExpression: "accountId = :val",
        ExpressionAttributeValues: {
            ":val": accountId,
        },
    };
    return await scanDynamoTable(params, []);
}

async function getAllDynamoVideos(accountId) {
    const params = {
        TableName: config.videoTable,
        FilterExpression: "accountId = :val",
        ExpressionAttributeValues: {
            ":val": accountId,
        },
    };
    return await scanDynamoTable(params, []);
}

async function getAllTeamMembers(accountId) {
    const params = {
        TableName: config.teamTable,
        FilterExpression: "accountId = :val",
        ExpressionAttributeValues: {
            ":val": accountId,
        },
    };
    return await scanDynamoTable(params, []);
}

async function scanDynamoTable(params, items) {
    try {
        const dynamodata = await dynamodb.scan(params).promise();
        items = items.concat(dynamodata.Items);
        if (dynamodata.LastEvaluatedKey) {
            params.ExclusiveStartKey = dynamodata.LastEvaluatedKey;
            return await scanDynamoTable(params, items);
        }
        return items;
    } catch (e) {
        throw Error(e);
    }
}
