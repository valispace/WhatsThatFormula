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
  thisJSON["definition"] = document.getElementById('formula_definition').value;
  thisJSON["keywords"]= (document.getElementById('formula_keywords').value).split(',');
  thisJSON["tags"] = (document.getElementById('formula_tags').value).split(',');
  thisJSON["href"] = document.getElementById('formula_link').value;
  thisJSON["contributed_by"] = document.getElementById('formula_contributor').value;
  results.innerHTML = JSON.stringify(thisJSON, null, 4);
}