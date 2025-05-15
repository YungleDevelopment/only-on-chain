/**
 * @author: Erick Hernández Silva (erick@yungle.com.mx)
 * @created: 23/08/2024
 * @updated: 23/08/2024
 * @file fileUpload.ts
 * @description: This file contains the logic to handle file uploads in the browser.
 */
import { FileUploadTemplateElements, FileIcons } from "../types/walletTypes";

export let inscribeFiles: File[] = []; // Variable para almacenar los archivos aceptados

const maxFileSize = 50 * 1024 * 1024; // 50 MB

function setup() {
  const dropZone = document.getElementById("dropZone") as HTMLElement;
  const fileInput = document.getElementById("fileInput") as HTMLInputElement;

  const template = document.querySelector("[file-template]") as HTMLElement;
  const inscriptionsText = document.querySelector(
    "[inscribe-inscriptions]"
  ) as HTMLElement;
  const templatesList = document.querySelector(
    "[file-templates-list]"
  ) as HTMLElement;

  const elements: FileUploadTemplateElements = {
    fileTemplate: template,
    templatesList: templatesList,
    inscriptionsText: inscriptionsText,
  };

  if (template) {
    template.style.display = "none";
  }

  dropZone.addEventListener("click", () => {
    fileInput.click();
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const files = e.dataTransfer!.files;
    handleFiles(files, elements);
  });

  fileInput.addEventListener("change", (e) => {
    const files = (e.target as HTMLInputElement).files!;
    handleFiles(files, elements);
  });
}



function handleFiles(files: FileList, elements: FileUploadTemplateElements) {
  const acceptedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "video/mp4",
  ];

  // Convertir FileList a un array
  const filesArray = Array.from(files);

  for (const file of filesArray) {
    if (!acceptedTypes.includes(file.type)) {
      alert(`Tipo de archivo no permitido: ${file.name}`);
      continue;
    }

    if (file.size > maxFileSize) {
      alert(
        `El archivo ${file.name} excede el tamaño máximo permitido de 50MB.`
      );
      continue;
    }

    inscribeFiles.push(file); // Guardar el archivo aceptado en inscribeFiles
    const fileTemplate = elements.fileTemplate.cloneNode(true) as HTMLElement;

    fileTemplate.style.display = "block"; // Mostrar el template clonado
    fileTemplate.removeAttribute("file-template"); // Eliminar el atributo para que no sea reutilizado

    const fileNameElement = fileTemplate.querySelector("[file-template-name]")!;
    fileNameElement.textContent = file.name;

    const icons: FileIcons = {
      mp4IconElement: fileTemplate.querySelector('[file-template-icon="mp4"]'),
      jpgIconElement: fileTemplate.querySelector('[file-template-icon="jpg"]'),
      pngIconElement: fileTemplate.querySelector('[file-template-icon="png"]'),
      pdfIconElement: fileTemplate.querySelector('[file-template-icon="pdf"]'),
    };

    Object.values(icons).forEach((icon) => {
      if (icon) icon.style.display = "none";
    });

    switch (file.type) {
      case "video/mp4":
        icons.mp4IconElement!.style.display = "block";
        break;
      case "application/pdf":
        icons.pdfIconElement!.style.display = "block";
        break;
      case "image/jpeg":
      case "image/jpg":
        icons.jpgIconElement!.style.display = "block";
        break;
      case "image/png":
        icons.pngIconElement!.style.display = "block";
        break;
    }

    const uploadingElement = fileTemplate.querySelector(
      "[file-template-uploading]"
    ) as HTMLElement;
    const completedElement = fileTemplate.querySelector(
      "[file-template-completed]"
    ) as HTMLElement;
    const progressBarElement = fileTemplate.querySelector(
      "[file-template-progress-bar]"
    ) as HTMLElement;

    uploadingElement.style.display = "none"; // Ocultar uploading
    completedElement.style.display = "none";
    progressBarElement.style.width = "0%";

    const removeButton = fileTemplate.querySelector(
      "[file-template-remove]"
    ) as HTMLElement;
    removeButton.addEventListener("click", () => {
      fileTemplate.remove();
      inscribeFiles = inscribeFiles.filter((f) => f !== file);
      updateInscriptionsCount(elements);
    });

    elements.templatesList.appendChild(fileTemplate);
  }

  updateInscriptionsCount(elements);
}

function updateInscriptionsCount(elements: FileUploadTemplateElements) {
  const count = inscribeFiles.length;
  elements.inscriptionsText.textContent =
    count === 1 ? `${count} inscription` : `${count} inscriptions`;
}


setup();