import fs from 'fs';


export enum Position {
    TOP_LEFT = 'top-left',
    TOP_RIGHT = 'top-right',
    BOTTOM_LEFT = 'bottom-left',
    BOTTOM_RIGHT = 'bottom-right',
}

export interface Label {
    position: Position;
    point: Point;
}

export interface Point {
    x: number;
    y: number;
}

export interface Line {
    points: Point[];
    label: Label | null;
    segments: Segment[];
}

export interface Segment {
    start: Point;
    end: Point;
}

function getSegmentsFromPoints (points: Point[]): Segment[] {
    const result: Segment[] = [];

    for (let i = 0; i < points.length - 1; i++) {
        result.push({
            start: points[i],
            end: points[i + 1],
        });
    }

    return result;
}


/**
 * Takes a string and returns multiple points as an array. Each line has multiple points.
 * @param line
 */
function getPoints (line: string): Line {
    // split by space
    const points = line.split(' ')
        .filter((point) => point !== '');

    // check if there are an odd number of points and throw an error
    if (points.length % 2 !== 0) {
        throw new Error('There are an odd number of points in the line');
    }

    // a point is x and x+1 in the array we know there are an even number of points
    const result: Point[] = [];

    for (let i = 0; i < points.length; i += 2) {
        result.push({
            x: parseInt(points[i], 10),
            y: parseInt(points[i + 1], 10),
        });
    }

    return {
        points: result,
        label: null,
        segments: getSegmentsFromPoints(result),
    }
}


/**
 *  Takes a sting to a file path and reads the file into an array of points.
 *  @param {string} path - The path to the file.
 */
export function readPoints (path: string): Promise<Line[]> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err);

                return;
            }

            const lines = data.split('\n')
                .filter((line) => line !== '')
                .map((line) => getPoints(line))

            resolve(lines);
        });
    });
}

export function writeLabels (labels: Label[], path: string) {
    const result = labels.map((label) => {
        return `${label.point.x} ${label.point.y} ${label.position}`;
    });

    fs.writeFile(path, result.join('\n'), (err) => {
        if (err) {
            throw err;
        }
    });
}
