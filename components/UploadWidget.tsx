import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const UploadWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleUpload = () => {
    // Implementar lógica de carga aquí
    console.log("Archivo cargado")
  }

  return (
    <div className="upload-widget">
      <Button onClick={() => setIsOpen(true)} className="bg-blue-500 text-white hover:bg-blue-600 rounded-full">
        Upload File
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <input type="file" className="mb-4" />
            <Button onClick={handleUpload}>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UploadWidget

