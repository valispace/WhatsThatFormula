var inputBox = document.getElementById('formula_tex'),
    results = document.getElementById('results');

inputBox.onkeyup = function(){
    document.getElementById('formula').innerHTML = '$$' + inputBox.value +'$$';
    MathJax.typeset()
}

function generateJSON(){
  var thisJSON = {};
  thisJSON["name"] = document.getElementById('formula_name').value;
  thisJSON["latex"] = '$$' + document.getElementById('formula_tex').value +'$$';
  thisJSON["description"] = document.getElementById('formula_description').value;
  //thisJSON["definition"] = document.getElementById('formula_definition').value;
  thisJSON["definition"] = {};
  var tableDefinitionRows = document.getElementById('variable_definition').rows;
  for(let i = 0; i< tableDefinitionRows.length; i++) {
    if(tableDefinitionRows[i].children[0].children["abr"].value) {
      var abr = tableDefinitionRows[i].children[0].children["abr"].value;
      abr = '$$' + abr + '$$';
      thisJSON["definition"][abr] = tableDefinitionRows[i].children[1].children["definition"].value;
    }
  };
  thisJSON["keywords"]= (document.getElementById('formula_keywords').value).split(',');
  thisJSON["tags"] = (document.getElementById('formula_tags').value).split(',');
  thisJSON["href"] = document.getElementById('formula_link').value;
  thisJSON["contributed_by"] = document.getElementById('formula_contributor').value;
  results.innerHTML = JSON.stringify(thisJSON, null, 4);
}

function addMoreRows(){
  var table = document.getElementById('variable_definition');
  var row = table.insertRow(table.rows.length);
  var cell1 =  row.insertCell(0);
  cell1.classList.add("abreviation");
  cell1.onclick = function () {
    showInput(this);
  }
  var cell2 = row.insertCell(1);
  cell1.innerHTML = `<input name="abr" type="text" required onblur="convertToLatex(this, 'latex_definition_${table.rows.length -1}')"><span id="latex_definition_${table.rows.length -1}"></span>`;
  cell2.innerHTML = `<input name="definition" type="text" required>`;
}

function convertToLatex(input, latex) {
  if(input.value) {
    document.getElementById(latex).innerHTML = '$$' + input.value + '$$';
    input.parentElement.classList.remove("show");
    MathJax.typeset();
  } else {
    document.getElementById(latex).innerHTML = '';
  }
}

function showInput(cell) {
  cell.classList.add("show");
}