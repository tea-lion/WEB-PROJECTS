function openModal(img,title){
  document.getElementById("previewImg").src = img;
  document.getElementById("previewTitle").innerText = title;
  document.getElementById("imgModal").style.display = "flex";
}
function closeModal(){
  document.getElementById("imgModal").style.display = "none";
}
