
## Gulp-web-replace

使用 gulp-webp 转换图片后，针对CSS和Html文件进行对应资源引用的替换。

### About gulp-webp:

> Convert images to [WebP](https://developers.google.com/speed/webp/) 

Supports PNG, JPEG, TIFF, WebP. 

[更多gulp-webp请查阅](https://github.com/sindresorhus/gulp-webp)



## Install

```
$ npm install --save-dev gulp-webp gulp-replace
```


## Usage gulp-webp & gulp-web-replace



```js

const gulp = require('gulp');
const webp = require('gulp-webp');
const webpReplace = require('gulp-webp-replace');
const rename = require('gulp-rename'); 


    function imageminImg() {
      return gulp.src('src/img/**.{jpeg|gif|png}')
            .pipe(gulpIf(config.webp, rename(function (file) {
                file.extname += '.webp';
            }))) // 可先重命名图片文件名*.jpg.web 也可省略此步骤
            .pipe(webp())
            .pipe(webpReplace()) // 转换完webp后，运行插件记录前后文件名变化 
            .pipe(gulp.dest('dist'))
        }
//编译 css
    function compileDistLess() {
        return gulp.src("src/css/**/*.css")            
            // .pipe(postcss())
            .pipe(webpReplace.collector()) // 替换css的webp链接
            .pipe(gulp.dest('dist'))
    }

    
    function compileHtml() {
        let options = [
          { match: "img[src]", attr: "src" },
          { match: "input[src]", attr: "src" },
          { match: "video[poster]", attr: "poster" },
          { match: "img[data-ng-src]", attr: "data-ng-src" }
      ];
        return gulp.src("src/**/*.{html|html}")        
        // 可以先进行一些编辑前置工作
            // .pipe(postHtml([require('posthtml-include')({
            //     root: _path,
            //     encoding: 'utf8'
            // })]))
            // .pipe(inlineSource(options))
            .pipe(gulpIf(config.webp,webpReplace.collector(options))) //处理webp的引用链接，再在这后面处理cdn等链接替换
            .pipe(gulp.dest("dist"));
    }


```

## API


A gulp plugin inspired by [trumpet(https://github.com/tivac/trumpet).

使用的trumpet插件来处理html

Will prefix relative urls in `<link>`, `<script>` and `<img>` tags

可以在处理html的时候传入一个对像数组，每个对像的

* math css查询表达式，通过这个表达式匹配html元素 

* attr 需要替换掉匹配到的html元素的属性值

_____


You can optionally pass a second argument along with the prefix string to override the default selection statements. The default config looks like this:

```js
[
  { match: "script[src]", attr: "src" },
  { match: "link[href]", attr: "href"},
  { match: "img[src]", attr: "src"},
  { match: "input[src]", attr: "src"}
]
```


## webp API

### webp(options?)

See the `imagemin-webp` [options](https://github.com/imagemin/imagemin-webp#imageminwebpoptions).

Note that unsupported files are ignored.
