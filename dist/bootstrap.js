'use strict';Object.defineProperty(exports,'__esModule',{value:true});const customModuleLoader=require('module');class CustomModuleLoader{constructor(){this.cOptions=require('../tsconfig.json').compilerOptions;this.replacePaths={};Object.keys(this.cOptions.paths).forEach(alias=>{this.replacePaths[alias.replace(/\*.?/,'(.*)')]=this.cOptions.paths[alias][0].replace(/\*.?/,'$1');});const aCML=customModuleLoader;aCML._originalResolveFilename=aCML._resolveFilename;aCML._resolveFilename=(request,parent,isMain)=>{Object.keys(this.replacePaths).forEach(matchString=>{const regex=new RegExp(matchString);if(request.match(regex)){request=[process.cwd(),this.cOptions.outDir,request.replace(regex,this.replacePaths[matchString])].join('/');}});return customModuleLoader._originalResolveFilename(request,parent,isMain);};}}exports.CustomModuleLoader=CustomModuleLoader;exports.moduleLoader=new CustomModuleLoader();