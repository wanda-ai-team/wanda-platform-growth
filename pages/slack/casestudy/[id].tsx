
import { GETApiCall, POSTApiCall } from '@/utils/api/commonAPICall';
import toastDisplay from '@/utils/common/toast';
import { Textarea, Button, VStack, Spinner, Center } from '@chakra-ui/react';
import { set } from 'immer/dist/internal';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
export default function CaseStudy() {
  const [data, setData] = useState<any>({});
  const [originalData, setOriginalData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  async function updateUseCase(newData: any) {
    await POSTApiCall('/api/db/updateDBEntryByID',
      {
        collection: 'useCases',
        id: id,
        updateBody: { content: newData },
      }).then(async (data1) => {
        if (data1.success) {
          toastDisplay("Correctly updated", true)
          setOriginalData({ ...originalData, content: newData });
        } else {
          toastDisplay("Error updating", false)
        }
      }).catch((err) => {
        toastDisplay("Error updating", false)
      });
  }

  async function getUseCase() {
    await POSTApiCall('/api/db/getDBEntryByID', {
      collection: 'useCases',
      id: id,
    }).then(async (data1) => {
      if (data1.content.meetingTitle !== undefined) {
        setData(data1.content);
        setOriginalData(data1.content);
      }
    })

    setLoading(false);
  }

  useEffect(() => {
    if (id !== undefined) {
      getUseCase();
    }
  }, [id]);


  return (
    <>
      {loading
        ?
        <>
          <Center h='80vh'>
            <Spinner
              thickness='4px'
              speed='0.65s'
              emptyColor='gray.200'
              color='blue.500'
              size='xl' />
          </Center>
        </>
        :

        <div>
          <VStack>
            <h1>
              Meeting Title: {data.meetingTitle}
            </h1>

            <Textarea
              value={data.content}
              style={{ height: '70vh', width: '90vw' }}
              onChange={(e) => { setData({ ...data, content: e.target.value }); }}
            />
            <Button
              isDisabled={data.content === originalData.content}
              size='sm'
              colorScheme="purple"
              onClick={() => updateUseCase(data.content)}
            >
              Save
            </Button>
          </VStack>
        </div>
      }
    </>
  );
}


CaseStudy.auth = true;