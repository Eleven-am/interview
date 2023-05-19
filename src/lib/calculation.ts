import { Point, Line, Label, Position, Segment } from './readPoints';
const width = 100;
const height = 50;

/**
 * Takes a line and returns a specific point in the line based on the ratio
 * @param line
 * @param ratio
 */
function getPointInALine (line: Line, ratio: number): Point {
    const midPointIndex = Math.floor(line.points.length * ratio);

    return line.points[midPointIndex];
}

/**
 * Takes a segment and calculates the slope
 * @param segment
 */
function calculateSlope (segment: Segment): number {
    return (segment.end.y - segment.start.y) / (segment.end.x - segment.start.x);
}

/**
 * Checks if two segments intersect or touch
 * @param segmentA
 * @param segmentB
 */
function checkIfSegmentsIntersect(segmentA: Segment, segmentB: Segment) {
    // check if the segments are parallel
    const slopeA = calculateSlope(segmentA);
    const slopeB = calculateSlope(segmentB);

    if (
        (slopeA === slopeB) &&
        (
            (segmentA.start.x >= segmentB.start.x && segmentA.end.x <= segmentB.end.x) ||
            (segmentA.start.x <= segmentB.start.x && segmentA.end.x >= segmentB.end.x)
        ) &&
        (
            (segmentA.start.y >= segmentB.start.y && segmentA.end.y <= segmentB.end.y) ||
            (segmentA.start.y <= segmentB.start.y && segmentA.end.y >= segmentB.end.y)
        )
    ) {
            return true;
    }


    const det = (segmentA.end.x - segmentA.start.x) * (segmentB.end.y - segmentB.start.y) - (segmentB.end.x - segmentB.start.x) * (segmentA.end.y - segmentA.start.y);
    if (det === 0) {
        return false;
    } else {
        const lambda = ((segmentB.end.y - segmentB.start.y) * (segmentB.end.x - segmentA.start.x) + (segmentB.start.x - segmentB.end.x) * (segmentB.end.y - segmentA.start.y)) / det;
        const gamma = ((segmentA.start.y - segmentA.end.y) * (segmentB.end.x - segmentA.start.x) + (segmentA.end.x - segmentA.start.x) * (segmentB.end.y - segmentA.start.y)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}

/**
 * Checks if a point is in a rectangle
 * @param lines
 * @param corner
 * @param anchor
 */
function checkIfRectangleHasAPoint (lines: Line[], corner: Point, anchor: Point) {
    //a region is a rectangle in which a point can be in or not

    const smallestX = Math.min(anchor.x, corner.x);
    const smallestY = Math.min(anchor.y, corner.y);

    const largestX = Math.max(anchor.x, corner.x);
    const largestY = Math.max(anchor.y, corner.y);

    for (const line of lines) {
        for (const point of line.points) {
            if (
                // check if the point is in the region
                (point.x >= smallestX && point.x <= largestX && point.y >= smallestY && point.y <= largestY) &&
                (point.x !== anchor.x && point.y !== anchor.y)
            ) {
                return true;
            }
        }

        // if there is no point in the region then check if the line has a label and the label is in the region
        if (line.label === null) {
            continue;
        }

        const label = line.label;
        let labelTopLeft: Point;
        let labelTopRight: Point;
        let labelBottomLeft: Point;
        let labelBottomRight: Point;

        switch (label.position) {
            case Position.TOP_LEFT:
                labelTopLeft = {
                    x: label.point.x - width,
                    y: label.point.y - height,
                }
                labelTopRight = {
                    x: label.point.x,
                    y: label.point.y - height,
                }
                labelBottomLeft = {
                    x: label.point.x - width,
                    y: label.point.y,
                }
                labelBottomRight = label.point;
                break;
            case Position.TOP_RIGHT:
                labelTopLeft = {
                    x: label.point.x,
                    y: label.point.y - height,
                }
                labelTopRight = {
                    x: label.point.x + width,
                    y: label.point.y - height,
                }
                labelBottomLeft = label.point;
                labelBottomRight = {
                    x: label.point.x + width,
                    y: label.point.y,
                }
                break;
            case Position.BOTTOM_LEFT:
                labelTopLeft = {
                    x: label.point.x - width,
                    y: label.point.y,
                }
                labelTopRight = label.point;
                labelBottomLeft = {
                    x: label.point.x - width,
                    y: label.point.y + height,
                }
                labelBottomRight = {
                    x: label.point.x,
                    y: label.point.y + height,
                }
                break;
            case Position.BOTTOM_RIGHT:
                labelTopLeft = label.point;
                labelTopRight = {
                    x: label.point.x + width,
                    y: label.point.y,
                }
                labelBottomLeft = {
                    x: label.point.x,
                    y: label.point.y + height,
                }
                labelBottomRight = {
                    x: label.point.x + width,
                    y: label.point.y + height,
                }
                break;
        }

        const labelPoints = [
            labelTopLeft,
            labelTopRight,
            labelBottomLeft,
            labelBottomRight,
        ]

        for (const point of labelPoints) {
            if (point.x >= smallestX && point.x <= largestX && point.y >= smallestY && point.y <= largestY) {
                return true;
            }
        }

    }

    return false;
}

/**
 * Checks if a rectangle intersects with a line
 * @param lines
 * @param corner
 * @param anchor
 */
function checkIfRectangleIntersects (lines: Line[], corner: Point, anchor: Point) {
    const labelSegments: Segment[] = [
        {
            // top part of the label
            start: {
                x: Math.min(anchor.x, corner.x),
                y: Math.min(anchor.y, corner.y),
            },
            end: {
                x: Math.max(anchor.x, corner.x),
                y: Math.min(anchor.y, corner.y),
            }
        },
        {
            // right part of the label
            start: {
                x: Math.max(anchor.x, corner.x),
                y: Math.min(anchor.y, corner.y),
            },
            end: {
                x: Math.max(anchor.x, corner.x),
                y: Math.max(anchor.y, corner.y),
            }
        },
        // bottom part of the label
        {
            start: {
                x: Math.min(anchor.x, corner.x),
                y: Math.max(anchor.y, corner.y),
            },
            end: {
                x: Math.max(anchor.x, corner.x),
                y: Math.max(anchor.y, corner.y),
            }
        },
        // left part of the label
        {
            start: {
                x: Math.min(anchor.x, corner.x),
                y: Math.min(anchor.y, corner.y),
            },
            end: {
                x: Math.min(anchor.x, corner.x),
                y: Math.max(anchor.y, corner.y),
            }
        }
    ]

    for (const segment of labelSegments) {
        for (const line of lines) {
            for (const seg of line.segments) {
                if (checkIfSegmentsIntersect(segment, seg)) {
                    return true;
                }
            }
        }
    }

    return false;
}

/**
 * Checks if it is possible to place a label in a given position
 * @param lines
 * @param line
 * @param candidate
 */
function checkIfSpaceAvailable (lines: Line[], line: Line, candidate: Point): Label | null {
    const topLeft: Point = {
        x: candidate.x - width,
        y: candidate.y - height,
    }

    const bottomRight: Point = {
        x: candidate.x + width,
        y: candidate.y + height,
    }

    const topRight: Point = {
        x: candidate.x + width,
        y: candidate.y - height,
    }

    const bottomLeft: Point = {
        x: candidate.x - width,
        y: candidate.y + height,
    }

    // FOR TOP LEFT
    if (!checkIfRectangleHasAPoint(lines, topLeft, candidate) && !checkIfRectangleIntersects(lines, topLeft, candidate)) {
        const label: Label = {
            position: Position.TOP_LEFT,
            point: candidate,
        }

        line.label = label;
        return label;
    }

    // FOR TOP RIGHT
    if (!checkIfRectangleHasAPoint(lines, topRight, candidate) && !checkIfRectangleIntersects(lines, topRight, candidate)) {
        const label: Label = {
            position: Position.TOP_RIGHT,
            point: candidate,
        }

        line.label = label;
        return label;
    }

    // FOR BOTTOM LEFT
    if (!checkIfRectangleHasAPoint(lines, bottomLeft, candidate) && !checkIfRectangleIntersects(lines, bottomLeft, candidate)) {
        const label: Label = {
            position: Position.BOTTOM_LEFT,
            point: candidate,
        }

        line.label = label;
        return label;
    }

    // FOR BOTTOM RIGHT
    if (!checkIfRectangleHasAPoint(lines, bottomRight, candidate) && !checkIfRectangleIntersects(lines, bottomRight, candidate)) {
        const label: Label = {
            position: Position.BOTTOM_RIGHT,
            point: candidate,
        }

        line.label = label;
        return label;
    }

    return null;
}

/**
 * Finds a possible position of a label in a line
 * @param lines
 * @param line
 */
export function findLabelPosition (lines: Line[], line: Line): Label | null {
    // perform a binary search to find the point
    let min = 0;
    let max = 1;
    let mid = 0.5;

    const point = getPointInALine(line, mid);
    const label = checkIfSpaceAvailable(lines, line, point);

    if (label !== null) {
        return label;
    }

    while (min < max) {
        mid = (min + max) / 2;
        const minMid = (min + mid) / 2;
        const point2 = getPointInALine(line, minMid);
        const label2 = checkIfSpaceAvailable(lines, line, point2);

        if (label2 !== null) {
            return label2;
        }

        const maxMid = (max + mid) / 2;
        const point3 = getPointInALine(line, maxMid);
        const label3 = checkIfSpaceAvailable(lines, line, point3);

        if (label3 !== null) {
            return label3;
        }

        if (min !== 0) {
            const zeroMin = min / 2;
            const point4 = getPointInALine(line, zeroMin);
            const label4 = checkIfSpaceAvailable(lines, line, point4);

            if (label4 !== null) {
                return label4;
            }
        }

        if (max !== 1) {
            const zeroMax = (max + 1) / 2;
            const point5 = getPointInALine(line, zeroMax);
            const label5 = checkIfSpaceAvailable(lines, line, point5);

            if (label5 !== null) {
                return label5;
            }
        }

        min = minMid;
        max = maxMid;
    }

    return null;
}
