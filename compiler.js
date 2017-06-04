var fs = require('fs');
var exec = require('child_process').execSync;
var readLastLines = require('read-last-lines');

// 2 input and 21 iterations
// 2 input or 23 iterations
// 3 input and 14 iterations
// 3 input (2) or 15 iterations
// 3 input (1) or 16 iterations

var truthtable = [
  [[0, 0, 0], 0],
  [[0, 0, 1], 1],
  [[0, 1, 0], 1],
  [[0, 1, 1], 1],
  [[1, 0, 0], 1],
  [[1, 0, 1], 1],
  [[1, 1, 0], 1],
  [[1, 1, 1], 1]
];

weight = 0;

var error = 1;
var iteration = 1;

while(error){
  error = 0;
  // Check truthtable
  console.log("Iteration: ", iteration);
  console.log("Using weight: ", weight);
  for(var i = 0; i < truthtable.length; i++){
    var value = getValue(truthtable[i][0], weight, i, false);
    //console.log(value);
    if(hasError(value, truthtable[i][1])) error++;
  }

  console.log("");
  iteration++;
  if(error) weight += 0.1;
}

// Loop the inputs again with the correct weight and save the simulation data
for(var i = 0; i < truthtable.length; i++){
  getValue(truthtable[i][0], weight, i, true);
}

console.log("Training successful in ", iteration, "iterations");

function hasError(value, target){
  console.log(value, target);
  if(value > target-0.2 && value < target+0.2) return false;
  else return true;
}

function getValue(input, weight, index, saveData){
  var dsd = createDSD(input, weight);

  fs.writeFileSync("dsd.dna", dsd);

  exec("dsd.exe dsd.dna -simulate");

  var data = fs.readFileSync("dsd_simulation/deterministic.tsv", "utf8");
  if(saveData) fs.writeFileSync(i+".tsv", data);
  data = data.split("\n");
  data = data[data.length-1];
  data = data.split("\t")[1];


  return data;
}

function createDSD(inputs, weight){

var dsd = "";

dsd += "directive plot <S"+(inputs.length*3+3)+"L^ S"+(inputs.length*3+3)+" S"+(inputs.length*3+3)+"R^>\n";
dsd += "directive duration 2000000.0 points 1000\n";
dsd += "directive compilation infinite\n";
dsd += "directive simulation deterministic\n";
dsd += "def unbind = 0.1126 (* normal toehold dissociation rate constant /s *)\n";
dsd += "def fastunbind = 0.95 (* fast toehold dissociation rate constant /s *)\n";
dsd += "def fast = 0.012 (* fast toehold binding rate constant /nM/s *)\n";
dsd += "def normal = 0.0003 (* normal toehold binding rate constant /nM/s *)\n";
dsd += "def slow = 0.000015 (* slow toehold binding rate constant /nM/s *)\n";
dsd += "new T@slow,fastunbind\n";

dsd += "def signal(N, S1L, S1, S1R, S2L, S2, S2R) = N * <S1L^ S1 S1R^ T^ S2L^ S2 S2R^>\n";
dsd += "def threshold(N, S1R, S2L, S2, S2R) = N * {S1R^* T^*}[S2L^ S2 S2R^]\n";
dsd += "def gate(N, S2L, S2, S2R, S3L, S3, S3R) = N * {T^*}[S2L^ S2 S2R^ T^]<S3L^ S3 S3R^>\n";
dsd += "def fuel(N, S1L, S1, S1R) = N * <S1L^ S1 S1R^ T^ Sf>\n";
dsd += "\n";


dsd += "(\n";
dsd += createNeuron(inputs, [weight, weight, weight], 8.9); // 2 2 8.9
dsd += "\n)";

//console.log(dsd);
return dsd;

}

function createNeuron(inputs, weights, threshold){
  var dsd = "";

  // Input gates
  for(var i = 0; i < inputs.length; i++){
    dsd += createInput(inputs[i], weights[i], i*3+1, i*3+2, inputs.length*3+1);
  }

  // Integration gate
  dsd += createGate(sum(weights), inputs.length*3+1, inputs.length*3+2);

  // Threshold gate
  dsd += createThreshold(threshold, inputs.length*3+1, inputs.length*3+2);
  dsd += createGate(1, inputs.length*3+2, inputs.length*3+3);
  dsd += createFuel(2, inputs.length*3+2);

  // Reporter
  dsd += createReporter(inputs.length*3+3)

  dsd = dsd.slice(0, -3);
  return dsd;
}

function createInput(input, weight, left, middle, right){
  var dsd = "";
  dsd += createSignal(input, left, middle);
  dsd += createThreshold(0.2, left, middle);
  dsd += createGate(weight, middle, right);
  dsd += createFuel(weight*2, right);
  return dsd;
}

function createSignal(concentration, left, right){
  return "signal("+concentration+", S"+left+"L, S"+left+", S"+left+"R, S"+right+"L, S"+right+", S"+right+"R) |\n";
}

function createThreshold(concentration, left, right){
  return "threshold("+concentration+", S"+left+"R, S"+right+"L, S"+right+", S"+right+"R) |\n";
}

function createGate(concentration, left, right){
  return "gate("+concentration+", S"+left+"L, S"+left+", S"+left+"R, S"+right+"L, S"+right+", S"+right+"R) |\n";
}

function createFuel(concentration, left){
  return "fuel("+concentration+", S"+left+"L, S"+left+", S"+left+"R) |\n";
}

function createReporter(left){
  return "1.5 * {T^*}[S"+left+"L^ S"+left+" S"+left+"R^] |\n";
}

function sum(input){
  var foo = 0;
  for(var i = 0; i < input.length; i++){
    foo += input[i];
  }
  return foo;
}
