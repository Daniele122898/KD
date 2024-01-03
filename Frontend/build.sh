#!/bin/bash

npm run build
rm -rf ../Backend/ProjectK/wwwroot
mkdir ../Backend/ProjectK/wwwroot
cp -r ./dist/project-k-fe/browser/* ../Backend/ProjectK/wwwroot/
