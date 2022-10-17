let canvas;
let bounds;
let ctx;
let hasLoaded = false;

let startX = 0;
let startY = 0;
let mouseX = 0;
let mouseY = 0;

let isDrawing = false;
const existingLines = [];
const existingIntersectionPoints = [];

function onmousedown(e) {
	if ( !hasLoaded || e.button !== 0) return;
	if ( !isDrawing) {
		startX = e.clientX - bounds.left;
		startY = e.clientY - bounds.top;
		isDrawing = true;
	}

	const line = new Line(ctx, startX, startY, mouseX, mouseY);
	line.draw();
}

function onmousemove(e) {
	if ( !hasLoaded) return;
	mouseX = e.clientX - bounds.left;
	mouseY = e.clientY - bounds.top;
	const dynamicLine = new Line(ctx, startX, startY, mouseX, mouseY);
	const dynamicIntersectionPoints = dynamicLine.getIntersections(existingLines);

	if (isDrawing) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		existingLines.forEach((line) => line.draw());
		existingIntersectionPoints.forEach((intersection) => new Circle(ctx, intersection.x, intersection.y).draw());
		dynamicLine.draw();
		dynamicIntersectionPoints.forEach((intersection) => new Circle(ctx, intersection.x, intersection.y).draw());
	}
}

function onmouseup(e) {
	if ( !hasLoaded || e.button !== 0) return;
	const line = new Line(ctx, startX, startY, mouseX, mouseY);
	const intersectionPoints = line.getIntersections(existingLines);

	if (isDrawing) {
		existingLines.push(line);
		existingIntersectionPoints.push(...intersectionPoints);

		isDrawing = false;
	}
}

function onclick() {
	animate();
}

function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const requestId = window.requestAnimationFrame(animate);

	existingLines.forEach((line, i, lines) => {
		line.draw();
		line.update(requestId);

		const dynamicIntersectionPoints = line.getIntersections(existingLines);
		dynamicIntersectionPoints.forEach((point) => new Circle(ctx, point.x, point.y).draw());

		if (Math.abs(line.startX - line.endX) < 5 && Math.abs(line.startY - line.endY) < 5) {
			lines.splice(i, 1);
		}
	});

	if (existingLines.length === 0) {
		window.cancelAnimationFrame(requestId);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
	existingIntersectionPoints.length = 0;
}

class Line {
	constructor(ctx, startX, startY, endX, endY) {
		this.ctx = ctx;
		this.startX = startX;
		this.startY = startY;
		this.endX = endX;
		this.endY = endY;

		this.deltaX = Math.abs(this.endX - this.startX);
		this.deltaY = Math.abs(this.endY - this.startY);

		this.diffX = 1;
		this.diffY = 1;
	}

	draw() {
		this.ctx.strokeStyle = 'black';
		this.ctx.beginPath();
		this.ctx.moveTo(this.startX, this.startY);
		this.ctx.lineTo(this.endX, this.endY);
		this.ctx.stroke();
	}

	update() {
		if (this.deltaX > this.deltaY) {
			this.diffY = this.deltaY / this.deltaX;
		} else if (this.deltaX < this.deltaY) {
			this.diffX = this.deltaX / this.deltaY;
		}

		if (this.startX < this.endX) {
			this.startX += this.diffX;
			this.endX -= this.diffX;
		} else {
			this.startX -= this.diffX;
			this.endX += this.diffX;
		}

		if (this.startY < this.endY) {
			this.startY += this.diffY;
			this.endY -= this.diffY;
		} else {
			this.startY -= this.diffY;
			this.endY += this.diffY;
		}
	}

	getIntersections(prevLines) {
		return prevLines.reduce((points, line) => {
			let {startX, startY, endX, endY} = line;

			if ((this.startX === this.endX && this.startY === this.endY) || (startX === endX && startY === endY)) {
				return points;
			}
			const denominator = ((endY - startY) * (this.endX - this.startX) - (endX - startX) * (this.endY - this.startY));

			if (denominator === 0) return points;

			let ua = ((endX - startX) * (this.startY - startY) - (endY - startY) * (this.startX - startX)) / denominator;
			let ub = ((this.endX - this.startX) * (this.startY - startY) - (this.endY - this.startY) * (this.startX - startX)) / denominator;

			if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return points;

			let x = this.startX + ua * (this.endX - this.startX);
			let y = this.startY + ua * (this.endY - this.startY);

			points.push({x, y});

			return points;
		}, []);
	}
}

class Circle {
	constructor(ctx, centerX, centerY, radius = 5, startAngle = 0, endAngle = 2 * Math.PI) {
		this.ctx = ctx;
		this.centerX = centerX;
		this.centerY = centerY;
		this.radius = radius;
		this.startAngle = startAngle;
		this.endAngle = endAngle;
	}

	draw() {
		this.ctx.fillStyle = 'red';
		this.ctx.strokeStyle = 'black';
		this.ctx.beginPath();
		this.ctx.arc(this.centerX, this.centerY, this.radius, this.startAngle, this.endAngle);
		this.ctx.fill();
		this.ctx.stroke();
		this.ctx.closePath();
	}
}

window.onload = function () {
	const btn = document.querySelector('.button');
	canvas = document.querySelector('#canvas');
	ctx = canvas.getContext('2d');
	canvas.width = 600;
	canvas.height = 400;

	canvas.onmousedown = onmousedown;
	canvas.onmouseup = onmouseup;
	canvas.onmousemove = onmousemove;
	btn.onclick = onclick;

	bounds = canvas.getBoundingClientRect();
	hasLoaded = true;
};
