[1mdiff --git a/gulpfile.js b/gulpfile.js[m
[1mindex 37f12ad..034a100 100644[m
[1m--- a/gulpfile.js[m
[1m+++ b/gulpfile.js[m
[36m@@ -6,6 +6,7 @@[m [mvar concat = require('gulp-concat');[m
 var util = require('gulp-util');[m
 var filter = require('gulp-filter');[m
 var env = require('gulp-env');[m
[32m+[m[32mvar tailwindcss = require('tailwindcss')[m
 [m
 var webpack = require('webpack');[m
 var webpackConfig = require('./webpack.config.js');[m
[1mdiff --git a/src/client/css/_header.scss b/src/client/css/_header.scss[m
[1mindex e1c879f..2d2997b 100644[m
[1m--- a/src/client/css/_header.scss[m
[1m+++ b/src/client/css/_header.scss[m
[36m@@ -11,8 +11,7 @@[m
     display: flex;[m
     flex-direction: row;[m
     justify-content: left;[m
[31m-    align-items: center;[m
[31m-[m
[32m+[m[32m    align-items: flex-end;[m
     max-width: 1215px;[m
     margin: auto;[m
     @media (max-width: 926px) {[m
[36m@@ -63,14 +62,10 @@[m
 [m
     .info {[m
       color: #333;[m
[31m-      align-self: flex-end;[m
[31m-      margin: 0 auto;[m
[31m-      max-width: 450px;[m
[31m-[m
[32m+[m[32m      margin-left: auto;[m
       @media(max-width: 926px) {[m
[31m-        display: flex;[m
[31m-        flex-direction: column;[m
[31m-        width: 100vw;[m
[32m+[m[32m        margin-left: 0;[m
[32m+[m[32m        width: 75vw;[m
       }[m
     }[m
   }[m
[1mdiff --git a/src/client/css/_tag-search.scss b/src/client/css/_tag-search.scss[m
[1mindex 36f40b3..684562e 100644[m
[1m--- a/src/client/css/_tag-search.scss[m
[1m+++ b/src/client/css/_tag-search.scss[m
[36m@@ -1,6 +1,11 @@[m
 .tag-search-view {[m
   margin-left: 5px;[m
[32m+[m[32m  max-width: 1215px;[m
[32m+[m[32m  margin: 0 auto;[m
 [m
[32m+[m[32m  @media screen and (max-width: 1215px) {max-width: 910px;}[m
[32m+[m[32m  @media screen and (max-width: 910px) {max-width: 605px;}[m
[32m+[m[32m  @media screen and (max-width: 605px) {max-width: 300px;}[m
   h2 {[m
     .tag {[m
       font-style: italic;[m
