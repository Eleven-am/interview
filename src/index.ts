import path from 'path';
import { findLabelPosition } from './lib/calculation';
import { readPoints, Label, writeLabels } from './lib/readPoints';

const basic = path.join(__dirname, '../basic_test_routes.txt');
const zurichBern = path.join(__dirname, '../zurich_bern_routes.txt');
const zurichGeneva = path.join(__dirname, '../zurich_geneva_routes.txt');

const basicLabels = path.join(__dirname, '../basic_test_routes_labels.txt');
const zurichBernLabels = path.join(__dirname, '../zurich_bern_routes_labels.txt');
const zurichGenevaLabels = path.join(__dirname, '../zurich_geneva_routes_labels.txt');

function performAction (input: string, output: string) {
    return new Promise((resolve, reject) => {
        readPoints(input)
            .then((lines) => {
                const labels = lines.map((line) => findLabelPosition(lines, line))
                    .filter((label) => label !== null) as Label[];

                writeLabels(labels, output);
            })
            .then(resolve)
            .catch(reject);
    });
}

async function test () {
    // get start time
    const start = Date.now();

    await performAction(basic, basicLabels);
    await performAction(zurichBern, zurichBernLabels);
    await performAction(zurichGeneva, zurichGenevaLabels);

    // get end time
    const end = Date.now();

    console.log(`Time taken: ${end - start}ms`);
}

test();
