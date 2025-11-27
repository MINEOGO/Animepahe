import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import DownloadListItem from './DownloadListItem';

interface DownloadModelProps {
  links: {
    link: string,
    name: string
  }[],
  isOpen: boolean,
  onOpenChange: () => void,
  epName: string,
  seriesTitle: string,
  episodeNumber: string
}

const DownloadModel = ({ isOpen, onOpenChange, links, epName, seriesTitle, episodeNumber }: DownloadModelProps) => {
  return (
    <Modal 
        backdrop='blur' 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        isDismissable={true} 
        size="lg"
        classNames={{
            base: "bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl",
            header: "border-b border-white/10",
            body: "py-6",
            closeButton: "hover:bg-white/10 active:bg-white/20 text-white"
        }}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center text-white text-xl font-bold text-shadow">
                {epName}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-1">
                {
                    links.length > 0 ? (
                        links.map(({ link, name }) => (
                        <DownloadListItem 
                            key={link} 
                            name={name} 
                            link={link} 
                            seriesTitle={seriesTitle}
                            episodeNumber={episodeNumber}
                        />
                        ))
                    ) : (
                        <p className="text-center text-white/50 py-4">No links available.</p>
                    )
                }
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default DownloadModel
