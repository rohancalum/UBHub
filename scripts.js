const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const path = require(path);
const https = require('https');
const config = require('./config.js');
const session = require('client-sessions');

log = function () {
    console.log('logging...');
    // console.log(process.env);
};

updateLocations = function(lower, upper) {

    // config.rdsHost="192.168.99.100"; //this should be your Docker container's IP address
    config.rdsHost="127.0.0.1"; 
    config.rdsUser="root";
    config.rdsPassword="my-secret-pw";

    for (let i = lower; i < upper; i++) {
        let connection = mysql.createConnection({
            host: config.rdsHost,
            user: config.rdsUser,
            password: config.rdsPassword,
            database: config.rdsDatabase
        });

        connection.connect();
        let query = `select id, address, lat from locations where id = ${i};`;
        console.log(query);
        connection.query(query, function (err, rows, fields) {
            if (!err) {
                console.log(rows);
                console.log(rows[0].id);
                if(rows[0].id && rows[0].lat == null) {
                    getLatLong(rows[0].address, rows[0].id);
                } else {
                    console.log(`lat not null`);
                }
            } else {
                console.log(err);
            }
        });
        connection.end();
    }
};

function getLatLongAddresses(){
    let addresses = [
        "address 1",
        "address 2"
    ];
    for(let i = 0; i < addresses.length; i++){
        getLatLongSimple(addresses[i]);
    }
}

function getLatLongSimple(address) {
    getLatLong(address, null);
}

function getLatLong(address, id) {
    console.log("getLatLong");
    if(address){
        let addressQueryString = address.replace(/\s+/g, "+");
        //https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyAEKjvE48-VV37P2pGBWFphvlrx8BXGDCs
        let options = {
            host: 'maps.googleapis.com',
            path: '/maps/api/geocode/json?address=' + addressQueryString + "&key=AIzaSyAEKjvE48-VV37P2pGBWFphvlrx8BXGDCs",
            //since we are listening on a custom port, we need to specify it by hand
            //port: '1337',
            method: 'GET'
            // useQuerystring: true,
            // qs: 'address=' + "1600+Amphitheatre+Parkway,+Mountain+View,+CA" + "&key=AIzaSyAEKjvE48-VV37P2pGBWFphvlrx8BXGDCs"
        };

        let req = https.request(options, function(response) {
            let data = '';
            response.on('data', function(chunk) {
                data += chunk;
            });
            response.on('end', function() {
                let result = JSON.parse(data);
                // console.log(result);
                // country = '';
                if(result.results[0]){
                    //     for(component in result.results[0].address_components){
                    //         console.log("iterating");
                    //         console.log(component);
                    //         if(component.types){
                    //             console.log(component.long_name);
                    //             for(type in component.types){
                    //                 if(type == 'country'){
                    //                     country = component.long_name;
                    //                 }
                    //             }
                    //         }
                    //     }
                    //     console.log("country=" + country);
                    let lat = result.results[0].geometry.location.lat;
                    let lng = result.results[0].geometry.location.lng;
                    console.log(address + "$" + lat + "#" + lng);
                    if(id != null)
                        updateLocation(id, lat, lng);
                } else {
                    console.log(address + "no good");
                }
            });
            response.on('error', function(err) {
                console.log("google api error:" + err);
            });
        });
        req.end();
    } else {
        console.log("missing address");
    }
}

function updateLocation(id, lat, lng){
    const connection = mysql.createConnection({
        host: config.rdsHost,
        user: config.rdsUser,
        password: config.rdsPassword,
        database: config.rdsDatabase
    });

    connection.connect();
    query = 'CALL updateLocation(' + id + ', "' + lat + '", "' + lng + '")';
    console.log(query);
    connection.query(query, function(err, rows, fields) {
        if (!err) {
            console.log("location updated");
        } else {
            console.log(err);
        }
    });
    connection.end();
}

update = function() {

    // config.rdsHost="192.168.99.100"; //this should be your Docker container's IP address
    config.rdsHost="127.0.0.1"; //this should be your Docker container's IP address
    config.rdsUser="root";
    config.rdsPassword="my-secret-pw";

    const connection = mysql.createConnection({
        host: config.rdsHost,
        user: config.rdsUser,
        password: config.rdsPassword
        //database: config.rdsDatabase //we have not yet created the database schema, so trying to connect to a schema will not work
    });

    connection.connect();

    let query = [];
    let createDb;
    let useDb;

    let createUsersTable;
    let postsTable;
    let votesTable;
    let emailsTable;
    let locationsTable;

    let createUserProcedure;
    let createLocationSimpleProcedure;
    let loginProcedure;
    let updateLocationProcedure;
    let addEmailProcedure;
    let getAllUploadsByUserProcedure;
    let getUploadByIdProcedure;
    let getAllUsersProcedure;

    let addPostProcedure;
    let getPostProcedure;
    let getPostAndAllSubsProcedure;
    let getAllPostsProcedure;
    let getPostsByParentProcedure;
    let deletePostProcedure;
    let upvotePostProcedure;
    let downvotePostProcedure;
    let getDeltaVotesTotalProcedure;
    let getUpvotesTotalProcedure;
    let getDownvotesTotalProcedure;
    let getAuthorVoteForPostProcedure;
    let unvoteForPostProcedure;
    let addViewProcedure;
    let acceptPostProcedure;

    let programsTable;
    let createProgramProcedure;
    let sitesTable;
    let sitesByUserTable;
    let getSitesByUserProcedure;
    let getSelectedSiteByUserProcedure;
    let selectSiteForUserProcedure;
    let selectSiteForUserAndReturnItProcedure;
    let createSiteProcedure;
    let indicatorsTable;
    let createIndicatorProcedure;
    let createIndicatorInCategoryTable;
    let createIndicatorInCategoryProcedure;
    let indicatorValuesTable;
    let createIndicatorValueProcedure;
    let indicatorRatingsTable;

    let documentsTable;
    let participationTable;
    let mapButtonsTable;

    let categoriesTable;
    let createCategoryProcedure;
    let permissionsTable;
    let userDataTable;
    let privilegesLookUpTable;
    let getRepByUserProcedure;

    createDb = `CREATE DATABASE ubhub;`;
    query.push(createDb);

    useDb = `use ubhub;`;
    query.push(useDb);

    createUsersTable =
        `CREATE TABLE users(
            email VARCHAR(255) NOT NULL,
            userAddress VARCHAR(2000),
            hashedPassword CHAR(255) not null,
            alias VARCHAR(255) NOT NULL,
            privileges INT,
            PRIMARY KEY (email),
            UNIQUE INDEX (email)
        );`;
    query.push(createUsersTable);

    // createDevelopmentUser =
    //     INSERT INTO users(email, hashedPassword) VALUES ('user', '$2a$10$ZuthLMZuo.F9LOfYNs3NpO6eWrBJoq8NYyd7AmOgwC3sPQLBxUbT6');`;
    // query.push(createDevelopmentUser);

    postsTable =
        `CREATE TABLE posts(
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            parent INT,
            author VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            body TEXT,
            creationDate DATETIME,
            views INT,
            tags VARCHAR(2048),
            keywords VARCHAR(2048),
            status VARCHAR(255),
            acceptedAnswerId INT
        );`;
        //TODO: add something like the below for foreign key constraint
        //FOREIGN KEY (author) REFERENCES users(email)
    query.push(postsTable);

    votesTable =
        `CREATE TABLE votes(
            author VARCHAR(255) NOT NULL,
            postId INT NOT NULL,
            deltaUpvotes INT,
            FOREIGN KEY (author) REFERENCES users(email),
            FOREIGN KEY (postId) REFERENCES posts(id)
        );`;
    query.push(votesTable);

    emailsTable =
        `CREATE TABLE emails (
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`email\` VARCHAR(2048) CHARACTER SET utf8
        );`;
    query.push(emailsTable);

    locationsTable =
        `CREATE TABLE locations (
            \`id\` INT,
            \`inst_address\` VARCHAR(255) CHARACTER SET utf8,
            \`lat\` NUMERIC(10, 7),
            \`lng\` NUMERIC(10, 7),
            \`inst_title\` VARCHAR(255) CHARACTER SET utf8,
            \`country\` VARCHAR(255) CHARACTER SET utf8,
            \`scale\` VARCHAR(255) CHARACTER SET utf8,
            \`population\` INT,
            \`density_km2\` NUMERIC(14, 9),
            \`area_km2\` NUMERIC(12,3),
            \`area_ha\` NUMERIC(7, 2),
            \`biodiversity_url\` VARCHAR(512) CHARACTER SET utf8,
            \`url_verifydate\` DATETIME,
            \`wwf_biome\` VARCHAR(255) CHARACTER SET utf8,
            \`wwf_terrestrial_ecoregion\` VARCHAR(255) CHARACTER SET utf8,
            \`hotspot\` VARCHAR(255) CHARACTER SET utf8,
            \`conservation_status_wwf\` VARCHAR(255) CHARACTER SET utf8
        );`;
    query.push(locationsTable);

    createUserProcedure =
        `CREATE PROCEDURE createUser(IN emailInput VARCHAR(255), IN passwordHash VARCHAR(255), IN alias VARCHAR(255), IN userAddress VARCHAR(2000))\n
            BEGIN\n
            insert into users (email, hashedPassword, alias, userAddress) values(emailInput, passwordHash, alias, userAddress);\n
        END;`;
    query.push(createUserProcedure);

    createLocationSimpleProcedure =
        `CREATE PROCEDURE createLocationSimple(IN address VARCHAR(204), IN title VARCHAR(200), IN updateBy VARCHAR(255), IN country VARCHAR(51), IN scale VARCHAR(51), IN myJson VARCHAR(2000))\n
            BEGIN\n
            INSERT INTO locations (address, title, update_by, country, scale, myJson) VALUES (address, title, updateBy, country, scale, myJson);\n
            SELECT * FROM locations WHERE id=LAST_INSERT_ID();\n
        END;`;
    query.push(createLocationSimpleProcedure);

    loginProcedure =
        `CREATE PROCEDURE login(IN emailInput VARCHAR(255))\n
            BEGIN\n
            SELECT email, hashedPassword from users WHERE email = emailInput;\n
        END;`;
    query.push(loginProcedure);

    updateLocationProcedure =
        `CREATE PROCEDURE updateLocation(IN idEntry INT, IN lat FLOAT( 10, 6 ), IN lng FLOAT( 10, 6 ))\n
            BEGIN\n
            UPDATE locations SET lat = lat, lng = lng where id = idEntry;
        END;`;
    query.push(updateLocationProcedure);

    addEmailProcedure =
        `CREATE PROCEDURE addEmail(IN email VARCHAR(2048))\n
            BEGIN\n
            INSERT INTO emails (email) VALUES (email);\n
        END;`;
    query.push(addEmailProcedure);

    getAllUploadsByUserProcedure =
        `CREATE PROCEDURE getAllUploadsByUser(IN userId VARCHAR(2048))\n
            BEGIN\n
            SELECT * from locations where update_by = userId;\n //wrong
        END;`;
    query.push(getAllUploadsByUserProcedure);

    getUploadByIdProcedure =
        `CREATE PROCEDURE getUploadById(IN inputId int(11))\n
            BEGIN\n
            SELECT * from locations where id = inputId;
        END;`;
    query.push(getUploadByIdProcedure);

    getAllUsersProcedure =
        `CREATE PROCEDURE GetAllUsers(emailInput char(255))\n
            BEGIN\n
            SELECT * FROM Users where email = emailInput;\n
        END;`;
    query.push(getAllUsersProcedure);

    addPostProcedure =
        `CREATE PROCEDURE addForumPost(IN author varchar(255), IN parent varchar(255), IN subject varchar(255), IN body TEXT, IN creationDate DATETIME, IN tags varchar(2048))\n
            BEGIN\n
            INSERT INTO posts (author, parent, subject, body, creationDate, views, status, tags) VALUES (author, parent, subject, body, creationDate, 0, 'published', tags);\n
            SELECT * FROM posts WHERE id=LAST_INSERT_ID();\n
        END;`;
    query.push(addPostProcedure);

    getPostProcedure =
        `CREATE PROCEDURE getPostById(IN inputId int)\n
            BEGIN\n
            SELECT * FROM posts WHERE \`id\`=inputId;\n
        END;`;
    query.push(getPostProcedure);

    //todo: can cast
    //npm package sanitize
    //mysqlrealescapestring - cannot use parameters without an orm
    //also strip_tags has a js sanitizer
    //helmet npm package for security
    //pa11y tool for accesiblity cli like curl
    //knex or seqlize
    getPostAndAllSubsProcedure =
        `CREATE PROCEDURE getPostAndAllSubs(IN postId int)\n
            SELECT * FROM posts WHERE \`id\` = postId \n
            UNION\n
            SELECT * FROM posts WHERE \`parent\` = postId \n
            UNION\n
            SELECT * FROM posts WHERE \`parent\` in \n
        (SELECT id FROM posts WHERE \`parent\` = postId);`;

    query.push(getPostAndAllSubsProcedure);

    getAllPostsProcedure =
        `CREATE PROCEDURE getAllPosts()\n
            BEGIN\n
            SELECT * FROM posts;\n
        END;`;
    query.push(getAllPostsProcedure);

    getPostsByParentProcedure =
        `CREATE PROCEDURE getPostsByParent(IN parentId int)\n
            BEGIN\n
            SELECT * FROM posts WHERE \`parent\`=parentId;\n
        END;`;
    query.push(getPostsByParentProcedure);

    deletePostProcedure =
        `CREATE PROCEDURE deletePostById(IN id int)\n
            BEGIN\n
            DELETE FROM posts WHERE \`id\`=id;\n
        END;`;
    query.push(deletePostProcedure);

    upvotePostProcedure =
        `CREATE PROCEDURE upvotePostById(IN authorId VARCHAR(255), IN post INT)\n
            BEGIN\n
            INSERT INTO votes (author, postId, deltaUpvotes) VALUES(authorId, post, 1);\n
        END;`;
    query.push(upvotePostProcedure);

    downvotePostProcedure =
        `CREATE PROCEDURE downvotePostById(IN authorId VARCHAR(255), IN post INT)\n
            BEGIN\n
            INSERT INTO votes (author, postId, deltaUpvotes) VALUES(authorId, post, -1);\n
        END;`;
    query.push(downvotePostProcedure);

    getDeltaVotesTotalProcedure =
        `CREATE PROCEDURE getDeltaVotesTotal(IN post INT)\n
            BEGIN\n
            SELECT SUM(deltaUpvotes) from votes WHERE \`postId\` = post;\n
        END;`;
    query.push(getDeltaVotesTotalProcedure);

    getUpvotesTotalProcedure =
        `CREATE PROCEDURE getUpvotesTotal(IN post INT)\n
            BEGIN\n
            SELECT SUM(deltaUpvotes) from votes WHERE \`postId\` = post AND \`deltaUpvotes\` = 1;\n
        END;`;
    query.push(getUpvotesTotalProcedure);

    getDownvotesTotalProcedure =
        `CREATE PROCEDURE getDownvotesTotal(IN post INT)\n
            BEGIN\n
            SELECT SUM(deltaUpvotes) from votes WHERE \`postId\` = post AND \`deltaUpvotes\` = -1;\n
        END;`;
    query.push(getDownvotesTotalProcedure);

    getAuthorVoteForPostProcedure =
        `CREATE PROCEDURE getAuthorVoteForPost(IN post INT, IN authorId VARCHAR(255))\n
            BEGIN\n
            SELECT deltaUpvotes FROM votes WHERE \`author\` = authorId AND \`postId\` = post;\n
        END;`;
    query.push(getAuthorVoteForPostProcedure);

    unvoteForPostProcedure =
        `CREATE PROCEDURE unvoteForPost(IN post INT, IN authorId VARCHAR(255))\n
            BEGIN\n
            DELETE FROM votes WHERE \`author\` = authorId AND \`postId\` = post;\n
        END;`;
    query.push(unvoteForPostProcedure);

    addViewProcedure =
        `CREATE PROCEDURE addView(IN post INT)\n
            BEGIN\n
            UPDATE posts SET \`views\` = views + 1 WHERE id = post;\n
        END;`;
    query.push(addViewProcedure);

    acceptPostProcedure =
        `CREATE PROCEDURE acceptPost(IN post INT, IN answerId INT)\n
            BEGIN\n
            UPDATE posts SET \`acceptedAnswerId\` = answerId WHERE id = post;\n
        END;`;
    query.push(acceptPostProcedure);

    programsTable =
        `CREATE TABLE programs(
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`programName\` VARCHAR(2048) CHARACTER SET utf8,
            \`description\` VARCHAR(2048) CHARACTER SET utf8,
            \`programType\` INT,
            \`private\` BIT,
            \`author\` VARCHAR(255),
            \`creationDate\` DATE,
            \`iconFileName\` VARCHAR(255)
        );`;
    query.push(programsTable);

    createProgramProcedure =
        `CREATE PROCEDURE createProgram(IN programName VARCHAR(2048), IN author VARCHAR(255))\n
            BEGIN\n
            INSERT INTO programs(programName, author) VALUES (programName, author);\n
            SELECT * FROM programs WHERE id=LAST_INSERT_ID();\n
        END;`;
    query.push(createProgramProcedure);

    sitesTable =
        `CREATE TABLE sites(
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`siteName\` VARCHAR(2048) CHARACTER SET utf8
        );`;
            /*
            set site profile index of data points to int values that are negative so that we can reference them from the indicators
            example areaIndex INT = -1
            calculation: density = population / -1
            */
    query.push(sitesTable);

    sitesByUserTable =
        `CREATE TABLE sitesByUser(
            \`site\` INT NOT NULL,
            \`user\` VARCHAR(255) NOT NULL,
            \`selected\` BIT
        );`;
    query.push(sitesByUserTable);

    getSitesByUserProcedure =
        `CREATE PROCEDURE getSitesByUser(IN emailInput varchar(255))\n
            BEGIN\n
            SELECT * FROM sites where id IN (SELECT site FROM sitesByUser WHERE user = emailInput);\n
        END;`;
    query.push(getSitesByUserProcedure);

    getSelectedSiteByUserProcedure =
        `CREATE PROCEDURE getSelectedSiteByUserQuery(IN emailInput varchar(255))\n
            BEGIN\n
            SELECT * FROM sites where id IN (SELECT site FROM sitesByUser WHERE user = emailInput AND selected = 1);\n
        END;`;
    query.push(getSelectedSiteByUserProcedure);

    selectSiteForUserProcedure =
        `CREATE PROCEDURE selectSiteForUser(IN emailInput varchar(255), IN siteSelected INT)\n
            BEGIN\n
            update sitesByUser SET selected = 0 WHERE user = emailInput;\n
            update sitesByUser SET selected = 1 WHERE user = emailInput AND site = siteSelected;\n
        END;`;
    query.push(selectSiteForUserProcedure);

    selectSiteForUserAndReturnItProcedure =
        `CREATE PROCEDURE selectSiteForUserAndReturnIt(IN emailInput varchar(255), IN siteSelected INT)\n
            BEGIN\n
            CALL selectSiteForUser(emailInput, siteSelected);\n
            CALL getSelectedSiteByUserQuery(emailInput);\n
        END;`;
    query.push(selectSiteForUserAndReturnItProcedure);

    createSiteProcedure =
        `CREATE PROCEDURE createSite(IN siteName VARCHAR(2048), IN userInput VARCHAR(255))\n
            BEGIN\n
            INSERT INTO sites(siteName) VALUES (siteName);\n
            SET @last_id_in_sites = LAST_INSERT_ID();\n
            INSERT INTO sitesByUser(user, site) VALUES (userInput, @last_id_in_sites);\n
            CALL selectSiteForUser(userInput, @last_id_in_sites);\n
            SELECT * FROM sitesByUser WHERE site=LAST_INSERT_ID();\n
        END;`;
    query.push(createSiteProcedure);

    indicatorsTable =
        `CREATE TABLE indicators(
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`indicatorName\` VARCHAR(2048) CHARACTER SET utf8,
            \`positionInCategory\` INT,
            \`categoryId\` INT,
            \`archetype\` VARCHAR(255),
            \`weight\` FLOAT(10, 2),
            \`required\` BIT,
            \`description\` VARCHAR(2048) CHARACTER SET utf8,
            \`descriptionOfCalculation\` VARCHAR(2048) CHARACTER SET utf8, 
            \`calculation\` VARCHAR(2048),
            \`private\` BIT,
            \`author\` VARCHAR(255),
            \`creationDate\` DATE
        );`;
    query.push(indicatorsTable);

    createIndicatorProcedure =
        `CREATE PROCEDURE createIndicator(IN indicatorName VARCHAR(2048), IN archetype VARCHAR(255), IN author VARCHAR(255))\n
            BEGIN\n
            INSERT INTO indicators(indicatorName, archetype, author) VALUES (indicatorName, archetype, author);\n
            SELECT * FROM indicators WHERE id=LAST_INSERT_ID();\n
        END;`;
    query.push(createIndicatorProcedure);

    createIndicatorInCategoryTable =
        `CREATE TABLE indicatorInCategory(
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`indicatorTemplateId\` INT,
            \`positionInCategory\` INT,
            \`categoryId\` INT
     );`;
    query.push(createIndicatorInCategoryTable);

    createIndicatorInCategoryProcedure =
        `CREATE PROCEDURE createIndicatorInCategory(IN indicatorTemplateId INT, positionInCategory INT, categoryId INT)\n
            BEGIN\n
            INSERT INTO indicatorInCategory(indicatorTemplateId, positionInCategory, categoryId) VALUES (indicatorTemplateId, positionInCategory, categoryId);\n
            SELECT * FROM indicatorInCategory WHERE id=LAST_INSERT_ID();\n
        END;`;
    query.push(createIndicatorInCategoryProcedure);

    indicatorValuesTable =
        `CREATE TABLE indicatorValues(
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
            \`name\` VARCHAR(2048), 
            \`subIndicator\` INT, 
            \`type\` INT,
            \`required\` BIT,
            \`orderInOperation\` INT,
            \`rangeMin\` FLOAT(10, 2),
            \`rangeMax\` FLOAT(10, 2),
            \`defaultNumericalValue\` FLOAT(10, 2), 
            \`defaultTextValue\` VARCHAR(2048),
            \`completionThreshold\` FLOAT(10, 2)
        );`;
    query.push(indicatorValuesTable);

    createIndicatorValueProcedure =
        `CREATE PROCEDURE createIndicatorValue(IN indicatorName VARCHAR(2048), indicatorId INT, type INT)\n
            BEGIN\n
            INSERT INTO indicatorValues(name, subIndicator, type) VALUES (indicatorName, indicatorId, type);\n
        END;`;
    query.push(createIndicatorValueProcedure);

    indicatorRatingsTable =
        `CREATE TABLE indicatorRatings(
            \`indicator\` INT,
            \`user\` VARCHAR(255),
            \`rating\` INT
        );`;
    query.push(indicatorRatingsTable);

    documentsTable =
        `CREATE TABLE documents (
            \`id\` INT,
            \`inst_id\` INT,
            \`doc_type\` VARCHAR(255) CHARACTER SET utf8,
            \`doc_year\` INT,
            \`doc_title\` VARCHAR(255) CHARACTER SET utf8,
            \`doc_url\` VARCHAR(255) CHARACTER SET utf8,
            \`keywords\` VARCHAR(512) CHARACTER SET utf8,
            \`source_url\` VARCHAR(255) CHARACTER SET utf8,
            \`link_verified\` VARCHAR(255) CHARACTER SET utf8
        );`;
    query.push(documentsTable);

    participationTable =
        `CREATE TABLE participation (
            \`id\` INT,
            \`inst_id\` INT,
            \`part_category\` VARCHAR(255) CHARACTER SET utf8,
            \`part_name\` VARCHAR(255) CHARACTER SET utf8,
            \`part_year\` INT,
            \`part_data\` NUMERIC(8, 5),
            \`part_units\` VARCHAR(255) CHARACTER SET utf8,
            \`part_level\` VARCHAR(255) CHARACTER SET utf8,
            \`part_link_label\` VARCHAR(255) CHARACTER SET utf8,
            \`part_link\` VARCHAR(512) CHARACTER SET utf8,
            \`part_link_label2\` VARCHAR(255) CHARACTER SET utf8,
            \`part_link2\` VARCHAR(512) CHARACTER SET utf8,
            \`part_link_label3\` VARCHAR(255) CHARACTER SET utf8,
            \`part_link3\` VARCHAR(512) CHARACTER SET utf8,
            \`keywords\` VARCHAR(1024) CHARACTER SET utf8,
            \`link_verified\` VARCHAR(255) CHARACTER SET utf8
        );`;
    query.push(participationTable);

    mapButtonsTable =
        `CREATE TABLE mapButtons (
            \`part_name\` VARCHAR(255) CHARACTER SET utf8,
            \`button_category\` VARCHAR(255) CHARACTER SET utf8,
            \`button_text\` VARCHAR(255) CHARACTER SET utf8,
            \`image\` VARCHAR(512) CHARACTER SET utf8,
            \`marker_colors_by\` VARCHAR(255) CHARACTER SET utf8,
            \`marker_colors\` VARCHAR(255) CHARACTER SET utf8,
            \`button_link\` VARCHAR(255) CHARACTER SET utf8
        );`;
    query.push(mapButtonsTable);

    categoriesTable =
        `CREATE TABLE categories(
            \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`program\` INT,
            \`subCategory\` INT,
            \`categoryName\` VARCHAR(2048) CHARACTER SET utf8,
            \`positionInProgram\` INT,
            \`description\` VARCHAR(2048) CHARACTER SET utf8,
            \`completeColor\` VARCHAR(8) CHARACTER SET utf8,
            \`incompleteColor\` VARCHAR(8) CHARACTER SET utf8,
            \`partiallyCompleteColor\` VARCHAR(8) CHARACTER SET utf8,
            \`notApplicableColor\` VARCHAR(8) CHARACTER SET utf8
        );`;
    query.push(categoriesTable);

    createCategoryProcedure =
        `CREATE PROCEDURE createCategory(IN categoryName VARCHAR(2048), IN positionInProgram INT, IN program INT)\n
            BEGIN\n
            INSERT INTO categories(categoryName, positionInProgram, program) VALUES (categoryName, positionInProgram, program);\n
            SELECT * FROM categories WHERE id=LAST_INSERT_ID();\n
        END;`;
    query.push(createCategoryProcedure);

    permissionsTable =
        `CREATE TABLE permissions(
            \`user\` VARCHAR(255) NOT NULL, 
            \`permissionLevel\` INT, 
            \`program\` INT, 
            \`indicator\` INT, 
            \`site\` INT
        );`;
    query.push(permissionsTable);

    userDataTable =
        `CREATE TABLE userData(
            \`id\` NUMERIC(14, 0),
            \`userEmail\` VARCHAR(255),
            \`site\` INT,
            \`program\` INT,
            \`year\` INT,
            \`indicatorId\` INT,
            \`subIndicatorId\` INT,
            \`indicatorValue\` INT,
            \`numericalValue\` FLOAT(10, 2),
            \`textValue\` VARCHAR(2048),
            \`name\` VARCHAR(2048),
            \`notes\` VARCHAR(2048),
            \`jsonData\` json,
            \`type\` INT,
            \`privilegesLookUpId\` INT
        );`;
    //recorded value, projected value, target value, baseline, ACTION (optional, and set as added automatically to an Indicator as it is added to a Program Instance)
    query.push(userDataTable);

    privilegesLookUpTable =
        `CREATE TABLE privilegesLookUp(
            \`id\` NUMERIC(14, 0)
        );`;
    query.push(privilegesLookUpTable);

    getRepByUserProcedure =
        `CREATE PROCEDURE getRepByUser(IN inUser VARCHAR(255))\n
            BEGIN\n
            SELECT SUM(votes.deltaUpvotes) AS totalScore\n
            FROM posts\n
            JOIN votes\n
            ON votes.postId = posts.id\n
            WHERE posts.author = inUser;\n
        END\n;`;
    query.push(getRepByUserProcedure);




    // let insertIntoIndicatorsQuery =
    //     insert into programs(programName, description, programType, private) values('Singapore Index', 'An index made in Singapore', 0, 0);
    //
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Proportion of Natural Areas in the City, 1, 1, 
    //     archetype, 1.0, 1, description, (Total area of natural, restored and naturalised areas) ÷ (Total area of city), calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Connectivity Measures, 2,  1, 
    //     archetype, 1.0, 1, description, \nWhere:\n\nA total is the total area of all natural areas\n\nA 1 to A n are areas that are distinct from each other (i.e. more than or equal to 100m apart)\n\nn is the total number of connected natural areas\n\nThis measures effective mesh size of the natural areas in the city. A 1 to A n may consist of areas that are the sum of two or more smaller patches which are connected. In general, patches are considered as connected if they are less than 100m apart.\nHowever, exceptions to the above rule includes\nanthropogenic barriers such as:\nRoads (15m or more in width; or are smaller but have a high traffic volume of more than 5000 cars per day)\nRivers that are highly modified and other artificial barriers such as heavily concretised canals and heavily built up areas. Any other artificial structures that the city would consider as a barrier, calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Native Biodiversity in Built Up Areas (Bird Species), 3,  1, 
    //     archetype, 1.0, 1, description, Number of native bird species in built up areas where built up areas include impermeable surfaces like buildings, roads, drainage channels, etc., and anthropogenic green spaces like roof gardens, roadside planting, golf courses, private gardens, cemeteries, lawns, urban parks, etc. Areas that are counted as natural areas in indicator 1 should not be included in this indicator., calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Change in Number of Vascular Plant Species, 4,  1, 
    //     archetype, 1.0, 1, description, The change in number of native species is used for indicators 4 to 8. The three core groups are:\nIndicator 4 : vascular plants\nIndicator 5 : birds\nIndicator 6 : butterflies\nThese groups have been selected as data are most easily available and to enable some common comparison. Cities can select any two other taxonomic groups for indicators 7 and 8 (e.g., bryophytes, fungi, amphibians, reptiles, freshwater fish, molluscs, dragonflies, beetles, spiders, hard corals, marine fish, seagrasses, sponges, etc.) The above data from the first application of the Singapore Index would be recorded in Part I: Profile of the City as the baseline. Net change in species from the previous survey to the most recent survey is calculated as: Total increase in number of species (as a result of re-introduction, rediscovery, new species found, etc.) minus number of species that have gone extinct., calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Change in Number of Bird Species, 5,  1, 
    //     archetype, 1.0, 1, description, The change in number of native species is used for indicators 4 to 8. The three core groups are:\nIndicator 4 : vascular plants\nIndicator 5 : birds\nIndicator 6 : butterflies\nThese groups have been selected as data are most easily available and to enable some common comparison. Cities can select any two other taxonomic groups for indicators 7 and 8 (e.g., bryophytes, fungi, amphibians, reptiles, freshwater fish, molluscs, dragonflies, beetles, spiders, hard corals, marine fish, seagrasses, sponges, etc.) The above data from the first application of the Singapore Index would be recorded in Part I: Profile of the City as the baseline. Net change in species from the previous survey to the most recent survey is calculated as: Total increase in number of species (as a result of re-introduction, rediscovery, new species found, etc.) minus number of species that have gone extinct., calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Change in Number of Butterfly Species, 6,  1, 
    //     archetype, 1.0, 1, description, The change in number of native species is used for indicators 4 to 8. The three core groups are:\nIndicator 4 : vascular plants\nIndicator 5 : birds\nIndicator 6 : butterflies\nThese groups have been selected as data are most easily available and to enable some common comparison. Cities can select any two other taxonomic groups for indicators 7 and 8 (e.g., bryophytes, fungi, amphibians, reptiles, freshwater fish, molluscs, dragonflies, beetles, spiders, hard corals, marine fish, seagrasses, sponges, etc.) The above data from the first application of the Singapore Index would be recorded in Part I: Profile of the City as the baseline. Net change in species from the previous survey to the most recent survey is calculated as: Total increase in number of species (as a result of re-introduction, rediscovery, new species found, etc.) minus number of species that have gone extinct., calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Change in Number of Native Species (any other taxonomic group selected by the city), 7,  1, 
    //     archetype, 1.0, 1, description, The change in number of native species is used for indicators 4 to 8. The three core groups are:\nIndicator 4 : vascular plants\nIndicator 5 : birds\nIndicator 6 : butterflies\nThese groups have been selected as data are most easily available and to enable some common comparison. Cities can select any two other taxonomic groups for indicators 7 and 8 (e.g., bryophytes, fungi, amphibians, reptiles, freshwater fish, molluscs, dragonflies, beetles, spiders, hard corals, marine fish, seagrasses, sponges, etc.) The above data from the first application of the Singapore Index would be recorded in Part I: Profile of the City as the baseline. Net change in species from the previous survey to the most recent survey is calculated as: Total increase in number of species (as a result of re-introduction, rediscovery, new species found, etc.) minus number of species that have gone extinct., calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Change in Number of Native Species (any other taxonomic group selected by the city), 8,  1, 
    //     archetype, 1.0, 1, description, The change in number of native species is used for indicators 4 to 8. The three core groups are:\nIndicator 4 : vascular plants\nIndicator 5 : birds\nIndicator 6 : butterflies\nThese groups have been selected as data are most easily available and to enable some common comparison. Cities can select any two other taxonomic groups for indicators 7 and 8 (e.g., bryophytes, fungi, amphibians, reptiles, freshwater fish, molluscs, dragonflies, beetles, spiders, hard corals, marine fish, seagrasses, sponges, etc.) The above data from the first application of the Singapore Index would be recorded in Part I: Profile of the City as the baseline. Net change in species from the previous survey to the most recent survey is calculated as: Total increase in number of species (as a result of re-introduction, rediscovery, new species found, etc.) minus number of species that have gone extinct., calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Proportion of Protected Natural Areas, 9,  1, 
    //     archetype, 1.0, 1, description, (Area of protected or secured natural areas) ÷ (Total area of the city), calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Proportion of Invasive Alien Species, 10, 1, 
    //     archetype, 1.0, 1, description, (Number of invasive alien species) ÷ (Total number of species), calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Regulation of Quantity of Water, 11, 2, 
    //     archetype, 1.0, 1, description, (Total permeable area) ÷ (Total terrestrial area of the city), calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Climate Regulation: Carbon Storage and Cooling Effect Of Vegetation, 12, 2, 
    //     archetype, 1.0, 1, description, (Tree canopy cover) ÷ (Total terrestrial area of the city), calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Recreational and Educational Services: Area of Parks with Natural Areas, 13, 2, 
    //     archetype, 1.0, 1, description, (Area of parks with natural areas and protected or secured natural areas)*/1000 persons, calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Recreational and Educational Services: Number of Formal Education Visits per Child Below 16 Years to Parks with Natural Areas per Year, 14, 2, 
    //     archetype, 1.0, 1, description, Average number of formal educational visits per child below 16 years to parks with natural areas or protected or secured natural areas per year, calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Budget Allocated to Biodiversity, 15, 3, 
    //     archetype, 1.0, 1, description, (Amount spent on biodiversity related administration) ÷ (Total budget of city)\n\nComputation should include the city’s or municipality’s manpower budget as well as its operational and biodiversity related project expenditures. The calculation may also include the figures of government linked corporations that have a component spent on biodiversity, and the amount of government funds paid to private companies for biodiversity related administration where such figures are available., calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Number of Biodiversity Projects Implemented by the City Annually, 16, 3, 
    //     archetype, 1.0, 1, description, Number of programmes and projects that are being implemented by the city authorities, possibly in partnership with private sector, NGOs, etc. per year. In addition to submitting the total number of projects and programmes carried out, cities are encouraged to provide a listing of the projects and to categorise the list into projects that are:\n1. Biodiversity related\n2. Ecosystems services related, calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Policies, Rules and Regulations – Existence of Local Biodiversity Strategy and Action Plan, 17, 3, 
    //     archetype, 1.0, 1, description, descriptionOfCalculation, calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Institutional Capacity: Number of Biodiversity Related Functions, 18, 3, 
    //     archetype, 1.0, 1, description, descriptionOfCalculation, calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Institutional Capacity: Number of City or Local Government Agencies Involved in Inter-agency Co-operation Pertaining to Biodiversity Matters, 19, 3, 
    //     archetype, 1.0, 1, description, descriptionOfCalculation, calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Participation and Partnership: Existence of Formal or Informal Public Consultation Process, 20, 3, 
    //     archetype, 1.0, 1, description, descriptionOfCalculation, calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Participation and Partnership: Number of Agencies/Private Companies/NGOs/Academic Institutions/International Organisations with which the City is Partnering in Biodiversity Activities, Projects and Programmes, 21, 3, 
    //     archetype, 1.0, 1, description, descriptionOfCalculation, calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Education and Awareness: Is Biodiversity or Nature Awareness Included in the School Curriculum, 22, 3, 
    //     archetype, 1.0, 1, description, descriptionOfCalculation, calculation, 0);
    //     insert into indicators(indicatorName, positionInCategory, categoryId, archetype, weight, required, description, descriptionOfCalculation, calculation, private) values(Education and Awareness: Number of Outreach or Public Awareness Events Held in the City per Year, 23, 3, 
    //     archetype, 1.0, 1, description, descriptionOfCalculation, calculation, 0);
    //     ;
    //
    // insertIntoSingaporeIndexIndicatorValues =
    //     insert into indicatorValues () values ();`;
    //
    // insertIntoSingaporeIndexCategories =
    //     insert into categories (program, categoryName, order, description, completeColor, incompleteColor, partiallyCompleteColor, notApplicableColor) values (1, categoryName, 1, description, completeColor, incompleteColor, partiallyCompleteColor, notApplicableColor);
    //     insert into categories (program, categoryName, order, description, completeColor, incompleteColor, partiallyCompleteColor, notApplicableColor) values (1, categoryName, 2, description, completeColor, incompleteColor, partiallyCompleteColor, notApplicableColor);
    //     insert into categories (program, categoryName, order, description, completeColor, incompleteColor, partiallyCompleteColor, notApplicableColor) values (1, categoryName, 3, description, completeColor, incompleteColor, partiallyCompleteColor, notApplicableColor);
    //     ;





    /*
     Indicator ratings across multiple categories
     Indicator Certifications
     Wants popularity of indicators
     Stages of different Indicators - arbitrary
     */

    //user properties:
    //verified/unverified - ie:City of Chicago vs. some guy interested in Chicago

    //superadmins - Glen, Jen, Mika, CBI
    //managers - can create and edit custom indicators/programs can make data public and add a user or manager to a site and switch user privileges
    //view only - can only see information, cannot change it
    //worker - can input data
    //public - can view public data

    // usersQuery = superAdmins (Glen, Jen, Mika)
    //     
    //     ;

    // Achievements - (ie: Silver, gold, platinum)
    // Unique ID
    // Name
    // Icon
    // Program
    // Threshold

    // console.log(query.length);
    // console.log(query);
    // for(var i = 0; i < query.length; i++){
    //     console.log(query[i]);
    // }


     query = [useDbQuery, createIndicatorQuery, createIndicatorInProgramQuery];

    for(let i = 0; i < query.length; i++) {

        console.log(query[i]);
        connection.query(query[i], function (err, rows, fields) {
            if (!err) {
                console.log("success");
            } else {
                console.log('Error while performing Query.');
                console.log(err.code);
                console.log(err.message);
            }
        });

    }

    connection.end();
};

//node
//var scripts = require('./scripts');

module.exports.updateLocations = updateLocations;
module.exports.log = log;
module.exports.update = update;
module.exports.getLatLong = getLatLong;
module.exports.getLatLongAddresses = getLatLongAddresses;
