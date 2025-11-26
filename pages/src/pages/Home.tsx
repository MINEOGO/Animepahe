import { useState, useEffect } from 'react';
import { SearchItem, AiringResult } from 'fetch/requests';
import SearchBar from '../components/SearchBar';
import SearchResultItem from '../components/SearchResultItem';
import useAxios from '../hooks/useAxios';
import { ANIME } from '../config/config';
import { Spinner } from '@nextui-org/react';

const Home = () => {
  const [searchResult, setSearchResult] = useState<SearchItem[]>([]);
  const [airingList, setAiringList] = useState<SearchItem[]>([]);
  const { request, isLoading } = useAxios();

  // Fetch Top Airing on Load
  useEffect(() => {
    const fetchAiring = async () => {
      const response = await request<AiringResult>({
        server: ANIME,
        endpoint: `/?method=airing&page=1`,
        method: 'GET'
      });

      if (response && response.data) {
        // Map AiringItem to SearchItem format so we can reuse the card
        const mappedData: SearchItem[] = response.data.map((item) => ({
            id: item.id,
            title: item.anime_title,
            session: item.anime_session,
            poster: item.snapshot, // Using snapshot as poster
            episodes: item.episode, // This is the specific episode number
            type: 'TV', // Placeholder
            status: 'Airing', // Placeholder
            year: new Date(item.created_at).getFullYear(),
            score: null,
            season: ''
        }));
        setAiringList(mappedData);
      }
    };

    fetchAiring();
  }, []);

  // Decide what to show
  const dataToShow = searchResult.length > 0 ? searchResult : airingList;
  const isSearchActive = searchResult.length > 0;

  return (
    <div className="flex flex-col items-center gap-6">
        <div className="w-full max-w-xl glass-panel p-6 rounded-2xl">
             <h1 className="text-3xl font-bold text-white text-center mb-4 text-shadow">AnimePahe Downloader</h1>
             <SearchBar setSearchResult={setSearchResult} setHomeActive={() => {}} />
        </div>

        <div className="w-full px-4">
            <h2 className="text-xl text-white font-bold mb-4 ml-4 text-shadow">
                {isSearchActive ? 'Search Results' : 'Latest Releases'}
            </h2>
        </div>

        <div className='flex flex-wrap justify-center gap-6'>
        {
            isLoading && dataToShow.length === 0 ? (
                 <Spinner size='lg' color="white" />
            ) : (
                dataToShow.map((item) => (
                    <SearchResultItem
                        key={item.id}
                        data={item}
                    />
                ))
            )
        }
        </div>
    </div>
  );
};

export default Home;
