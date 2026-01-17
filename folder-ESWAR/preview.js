function openPreview(src){
  document.getElementById("previewImg").src = src;
  document.getElementById("previewBox").style.display = "flex";
}

function closePreview(){
  document.getElementById("previewBox").style.display = "none";
}

document.addEventListener("keydown", e => {
  if(e.key === "Escape") closePreview();
});
