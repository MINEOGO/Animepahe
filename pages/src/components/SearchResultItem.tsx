import { Card, CardHeader, CardBody, Image, Chip } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';
import { Prox } from '../utils/ImgProxy';
import { SearchItem } from 'fetch/requests';

interface SearchResultItemProps {
  data: SearchItem;
}

const SearchResultItem = ({ data }: SearchResultItemProps) => {
  const navigate = useNavigate();
  const { title, episodes, poster, status, type, year, score, session } = data;

  const handlePress = () => {
    navigate(`/anime/${session}`, { state: data });
  };

  return (
    <Card 
        isPressable 
        onPress={handlePress} 
        className="m-3 w-64 h-[400px] glass-panel transition-all duration-300 bg-transparent border-white/10 group"
        radius="lg"
    >
      <CardBody className="p-0 overflow-hidden relative h-full">
        <Image
          removeWrapper
          alt={title}
          className="z-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={Prox(poster)}
        />
        
        {/* Lighter Gradient Overlay: Only dark at the very bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
        
        {/* Floating Info (Top Right) */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 items-end">
             <Chip size="sm" variant="flat" className="bg-black/50 text-white backdrop-blur-md">{type}</Chip>
             {score && <Chip size="sm" variant="flat" className="bg-green-500/80 text-white backdrop-blur-md">★ {score}</Chip>}
        </div>

        <CardHeader className="absolute bottom-0 z-20 flex-col text-left items-start pb-4 px-4">
            <h4 className="font-bold text-lg text-white line-clamp-2 text-shadow mb-1">{title}</h4>
            <div className='flex justify-between w-full items-center opacity-80'>
                <span className="text-white text-xs font-semibold">{year}</span>
                <div className="flex gap-2 items-center">
                    <span className="text-white text-xs">{episodes} eps</span>
                    <span className={`w-2 h-2 rounded-full ${status === 'Finished' ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                </div>
            </div>
        </CardHeader>
      </CardBody>
    </Card>
  );
}

export default SearchResultItem;
