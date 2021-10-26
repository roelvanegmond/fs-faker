const config = require('config');
const fs = require('fs');
const faker = require('faker');
const fakeFile = require('fake-file-generator');

let directories = [];

// generate directory paths and create them recursively
let dirCount = 0;
while(dirCount < config.get('maxUniqueDirPaths')){

    const directoryPath = config.get('dataRoot') + faker.fake(generateDirectoryPath(config.get('pathConstructor'), config.get('maxDepth')));
    if(!fs.existsSync(directoryPath)){
        fs.mkdirSync(directoryPath, { recursive: true });
    }

    directories.push(directoryPath);

    dirCount++;
}

// randomly pick a path from the directories create a file
let fileCount = 0;
while(fileCount < config.get('maxFileCount')){

    const fileDirectory = getRandomValueFromArray(directories);
    fakeFile.makeFile(getRandomSubDirectory(fileDirectory, config.get('dataRoot')), getRandomFileSize(config.get('fileSizeMin'), config.get('fileSizeMax'))); // fixed size or in between size
    console.log(fileCount);
    fileCount++;
}

// get a sub directory from a file path and optionally excluding a part of the path that can be used as a sub directory
function getRandomSubDirectory(directoryPath, pathToExclude)
{
    let subDirs = directoryPath.split("/");
    let subDirMin;
    if(pathToExclude){
        subDirMin = pathToExclude.split("/").length;
    }
    
    let removedCount = 0;
    let toRemoveCount = Math.random()*subDirs.length | 0;

    if(subDirMin && toRemoveCount > subDirMin){
        toRemoveCount = toRemoveCount - subDirMin;
    }

    while(removedCount < toRemoveCount){
        subDirs.splice(-1);
        removedCount++;
    }

    let filePath = subDirs.join("/") + "/" + faker.system.fileName();
    return filePath;
}

function getRandomValueFromArray(array){
    return array[Math.random()*array.length | 0];
}

function generateDirectoryPath(constructor, maxDepth)
{
    let depth = 1;
    let path = "/" + getRandomValueFromArray(constructor);
    while(depth < maxDepth){
        path = path + "/" + getRandomValueFromArray(constructor);
        depth++;
    }
    return path;
}

function getRandomFileSize(min, max) {  
    return Math.floor(
        Math.random() * (max - min + 1) + min
      );
}