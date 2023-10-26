
import { Textarea } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
function Post() {
  const [data, setData] = useState({});
  const router = useRouter();
  const { id } = router.query;

  async function getUser() {
    console.log(id)
    if (id === undefined) {
      return;
    }
    await fetch('/api/db/getDBEntryByID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection: 'useCases',
        id: id,
        // condition: ['id'],
        // conditionOperation: ['=='],
        // conditionValue: [id],
        // numberOfConditions: 1,
      }),

    })
      .then((res) => res.json())
      .then(async (data1) => {
        if (data1.content.meetingTitle !== undefined) {
          setData(data1.content);
        } else {
        }
      }).catch((err) => {
      });
  }

  useEffect(() => {
    getUser();
  }, [id]);
  return (
    <div>
      <h1>
        Meeting Title: {data.meetingTitle}
      </h1>

      <Textarea
        value={data.content}
        style={{ height: '40vh', width: '90vw' }}
        onChange={(e) => { setData({ ...data, content: e.target.value }); } }
      />
    </div>
  );
}

export default Post;