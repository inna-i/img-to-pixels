// CanvasMosaic

var CanvasMosaic = new Function();

var CONST = {
	IMG_THUMBNAIL: 'image-thumbnail',
	IMG_LIST: 'img-list',
	MS_TILE_W: TILE_WIDTH !=0 ? TILE_WIDTH : 16,
	MS_TILE_H: TILE_HEIGHT !=0 ? TILE_HEIGHT : 16,
	UPLOAD_INPUT: 'img-upload',
	SPINNER: 'spinner',
};

// DOM manipulation
var DOMFunc = {
	hasClass: function(el, className) {
		if (el.classList)
			return el.classList.contains(className)
		else
			return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
	},
	addClass: function(el, className) {
		if (el.classList)
			el.classList.add(className)
		else if (!this.hasClass(el, className)) el.className += " " + className
	},
	removeClass: function(el, className) {
		if (el.classList)
			el.classList.remove(className)
		else if (this.hasClass(el, className)) {
			var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
			el.className=el.className.replace(reg, ' ')
		}
	}
};

CanvasMosaic.prototype.encodeImageURL = function(element) {
	var img = element.files[0];
	var fileReader = new FileReader();
	fileReader.onloadend = function() {
		CanvasMosaic.prototype.drawCanvasImage(fileReader.result);
		CanvasMosaic.prototype.appendImageThumbnail(fileReader.result)
	}
	fileReader.readAsDataURL(img);
};

CanvasMosaic.prototype.drawCanvasImage = function(url) {
	var imageElement = new Image();
	imageElement.onload = function() {
		CanvasMosaic.prototype.drawImageMosaic(this);
		document.querySelector('.' + CONST.SPINNER).style.display = 'none';
	};
	imageElement.src = url;
};

CanvasMosaic.prototype.appendImageThumbnail = function(url) {
	var imgThumbnail = document.createElement('img');
	imgThumbnail.src = url;
	imgThumbnail.className = CONST.IMG_THUMBNAIL;
	document.querySelector('.' + CONST.IMG_LIST).appendChild(imgThumbnail);

	imgThumbnail.addEventListener('click', function(e) {
		CanvasMosaic.prototype.drawCanvasImage(e.srcElement.currentSrc);
	})
};

CanvasMosaic.prototype.drawImageMosaic = function(imageElement) {
	var canvas = document.getElementById('mosaic'),
		context = canvas.getContext('2d'),
		horizontalRatio = canvas.width  / imageElement.width,
		verticalRatio =  canvas.height / imageElement.height,
		middleRatio =  Math.min( horizontalRatio, verticalRatio ),
		ratio  = middleRatio < 0.2
			? middleRatio + 0.2
			:  middleRatio,
		imageX = 0,
		imageY = 0,
		imageWidth = imageElement.naturalWidth,
		imageHeight = imageElement.naturalHeight,
		scaledImageWidth = parseInt((imageWidth*ratio*CONST.MS_TILE_W)/CONST.MS_TILE_W),
		scaledImageHeight = parseInt((imageHeight*ratio*CONST.MS_TILE_H)/CONST.MS_TILE_H);

	console.log(middleRatio);

	context.clearRect(0,0, canvas.width, canvas.height);
	canvas.height = scaledImageHeight;
	canvas.width = scaledImageWidth;
	context.drawImage(imageElement, 0,0,
		imageWidth, imageHeight,
		0,0,
		scaledImageWidth, scaledImageHeight);

	var imageData = context.getImageData(imageX, imageY, scaledImageWidth, scaledImageHeight);
	var data = imageData.data;

	// iterate over all pixels based on x and y coordinates
	for(var y = 0; y < scaledImageHeight/CONST.MS_TILE_H; y++) {
		var red, green, blue;
		// loop through each row
		for(var x = 0; x < scaledImageWidth/CONST.MS_TILE_W; x++) {
			red = toHex(data[((scaledImageWidth * y*CONST.MS_TILE_H) + x*CONST.MS_TILE_W) * 4]);
			green = toHex(data[((scaledImageWidth * y*CONST.MS_TILE_H) + x*CONST.MS_TILE_W) * 4 + 1]);
			blue = toHex(data[((scaledImageWidth * y*CONST.MS_TILE_H) + x*CONST.MS_TILE_W) * 4 + 2]);

			function toHex(int) {
				if (int == undefined) return;
				var hex = int.toString(16);
				return hex.length == 1 ? "0" + hex : hex;
			}
			context.fillStyle = '#' + red + green + blue;
			context.fillRect(x*CONST.MS_TILE_W, y*CONST.MS_TILE_H,
				CONST.MS_TILE_W, CONST.MS_TILE_H);
		}
	}
};

function DOMReady() {
	var fileInput  = document.getElementById(CONST.UPLOAD_INPUT);

	fileInput.addEventListener( "change", function(e) {
		CanvasMosaic.prototype.encodeImageURL(e.target);
		document.querySelector('.' + CONST.SPINNER).style.display = 'block';
	});
}


document.addEventListener("DOMContentLoaded", DOMReady);