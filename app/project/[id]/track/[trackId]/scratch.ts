/* Get initial information to provide page. 
The fastest way for me is to useEffect 
and make the page a client page

// I'm thinking this should be re-rendered once a new client has been submitted (a non authenticated user)
 */

/* useEffect(() => {
    // 1. get the project information based on the parameters (projectId and trackId)
    // 2. put all of the information into a project state
    // 3. add the track information to it's own state

    /*
      const res = await fetch(`/api/track?projectId=${params.projectId}&trackId=${params.trackId}`, {
        method: GET,
        headers: {
          Authorization: user?.id || {name: clientName, email: clientEmail}
        }
      })

      if (!res.ok) throw new Error("Could not find project")

      const projectFetch = await res.json()
      // projectFetch should return:
          for authenticated user
            all clients
            all comments
            isActive (if false, the project becomes readonly)
            title
            the specific file and it's information
            who uploaded it (if this doesn't match the auth user, the auth user has read-only privileges)
            the stream url from storage
          
          for client (non-authenticated viewer of page)
            title
            comments (the comments they submitted will be available for editing)
            file info
            read-only privileges
            balance (if not zero, the pay balance button should light up) -- coming later

      // stop the entire process if the track is not found. This could only mean the track was deleted. 
      if (!projectFetch.status === 200) throw Error("Data could not be found")

      
      // retrieve add the project and it's comments data to an object state
      const projectData = projectFetch.data.project
      const commentsData = projectFetch.data.comments
      

      // add the track to it's own state
      const song = projectData.files[0]
      const url = projectData.streamUrl
      
      setTrack({song: song, url: url})
    })
*/
