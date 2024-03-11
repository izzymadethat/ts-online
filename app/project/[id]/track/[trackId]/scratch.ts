/* Get initial information to provide page. 
The fastest way for me is to useEffect 
and make the page a client page.



// I'm thinking this should be re-rendered once a new client has been submitted (a non authenticated user)
 */

/*
 ==== Fetch Project Information =====
  0. check if the visitor is a user or client
        - if user, check if the user is the creator of project.
          otherwise, they have client privileges
        - check into local storage for client name and email
  1. get the project information based on the parameters (projectId and trackId)
  2. put all of the information into a project state
  3. add the track information to it's own state

  
  useEffect(() => {
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

// ================================== End ================================

/*
    ==== Submit a new comment ==== 
    Note: if the visitor is the user and the creator of the project, they will not see the add comments section, and all validation has been handled by the form created, so the information is to be expected. A future 'add notes' feature will most likely be implemented for those who've created the project.  


    0. check if client information is in local storage.
    1. send the data of the client's input to route "/api/comment"
        - Make sure client can not RESUBMIT while processing
    2. have route process information and return a response 
    3. whether uploaded or failed, show toast to client
    4. if the client does not have name and email in local storage, save their name and email to local storage (this is client side)
    5. finally, keep name and email populated so that client

    async function handleSubmitComment(e) {
      e.preventDefault()

      const clientData = { 
        name: localStorage.getItem("client-name") || ""
        email: localStorage.getItem("client-email") || ""
      }

      // if there's no client data in storage, create the data based on the client's input from the state variables
      if (!client.name && !client.email) {
        client.name = localStorage.setItem("client-name", clientName)
        client.email = localStorage.setItem("client-email", clientEmail)
      }
      
      const newComment = {
        name: client.name,
        email: client.email,
        timeInSong: isATimeStampedComment ? current time : undefined,
        comment: comment,
        projectId: projectId,
        trackId: trackId,
        type: isATimeStampedComment ? "REVISION" : "FEEDBACK"
        userId: project.user.id
      }


      const response = await fetch("/api/comment", {
        method: "POST",
        body: JSON.stringify(newComment),
        headers: {
          "Content-Type": "application/json"
        }
      })


      if (response.status !== 200) {
        return toast that comment couldn't be successfully submitted
      }

      toast that comment was submitted successfully

      set comment and comment uploading state back to default
    }
   
*/

// ============================== End ====================================

/*
    ==== When a user completes a task ===
    1. all checks should be documented in project.files.comments or similar
    2. filter the comment by id, then set its isCompleted to be true
    3. if isCompleted is true, add a strikethrough on comment text
    3. the user can check many, but won't be saved until submitted
    4. upon save changes button click update the database 

    
    ==== When a user unchecks a task ====
    1. filter the comment by id, then set its isCompleted to false
    2. upon save changes button click update the database 
    
   async function handleCompleteTask(id) {
      this is just when a user checks or unchecks a comment

      const commentToChange = project.files.comments.filter(comment => comment.id === id)
      
      setIsRevisionCompleted((prevValue) => {
        ...commentToChange, isCompleted: !prevValue
      })
   }


   async function handleSubmitCommentChanges() {
      
   }
*/
// ============================== End ======================================

// converted to server component - 3/8/24

/*
   async function getPlaybackUrl({projectId, userId, trackName}) {
      const urlFetch = await supabase.storage.from("files").getPublicUrl(`project-${projectId}/${userId}/${trackName}`)

      if (!urlFetch) return null;

      const url = urlFetch.data.publicUrl;

      return url;
   }

   async function getData({projectId, trackId }) {
      const project = await prisma.project.findUnique({
        where: {
          id: projectId
        },

        select: {
          title: true,
          user: true,
          clients: true,
          files: {
            where: {
              id: trackId
            },

            select: {
              id: true,
              name: true,
              type: true,
              uploadedBy: true,
              comments: {
                select: {
                  id: true,
                  client: true,
                  atTimeInSong: true,
                  clientId: true,
                  isCompleted: true,
                  text: true,
                  type: true,
                  createdAt: true,
                  updatedAt: true
                }
              }
            }
          },
          isActive: true 
        }
      })

      if (!project || !project.files) {
        return null
      }

      const streamUrl = await getPlaybackUrl({
        projectId,
        userId: project.user.id,
        trackName: project.files[0].name
      })
      
      if (!streamUrl) return null

      const data = {
        project,
        streamUrl,
        trackId
      }

      return data
   }

  //  Aux components

   export default async function TrackViewPage({params}) {
      const {getUser} = await getKindeSession()
      const user = await getUser()
      const client = !user;

      const track = await getData({
        projectId: params.id,
        trackId: params.trackId
      })
      
      if (!track) return redirect("/dashboard/projects");
      
      const isProjectCreator = user?.id === track.project.user.id 
      const trackName = track.project.files[0].name

      if (client && typeof window !== "undefined") {
        const existingClient = {
          client_name: localStorage.getItem("client-name"),
          client_email: localStorage.getItem("client-email"),

        }
      }

      // ========= FUNCTIONS ===============
      async function submitComment(formData: FormData) {
        "use server"
        
        const isATimestampedComment = formData.get("").valueOf()?????
        const clientName = formData.get("client-name")
        const clientEmail = formData.get("client-email")
        const clientComment = formData.get("client-comment")

        const newComment = {
          name: clientName,
          email: formData.get("client-email"),
          timeInSong: isATimeStampedComment ? current time : undefined,
          comment: clientComment,
          projectId: params.id,
          trackId: params.trackId,
          type: isATimeStampedComment ? "REVISION" : "FEEDBACK"
          userId: track.project.user.id
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("client-name", clientName)
          localStorage.setItem("client-email", clientEmail)
        }
      }

      return (
        <div>
          <div>
            <h1>{trackName?.replace(/_/g, " ").split(".")[0] || "Name not set"}</h1>
            <h3>From {project?.title}</h3> 

            <div>
              
              // ====== Payment Button =======
              only client sees payment button.
              if project is paid button is disabled
              
              {client && (
                <form action={handleProjectPayment}>
                  <ProjectPaymentButton />
                </form>
              )}

              // ======= Comments SideBar ===========
              
              only the authenticated user who created the project can view and checkoff comments.
              {
                user && isProjectCreator ? (
                  <CommentsSidebar />
                ) : null
              }

              // ====== Audio Player =====
              <div>
                <AudioPlayer 
                  source={track.streamUrl}
                />
                
                
                // ====== Client Comment Submission Form =======
                {client && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">Thoughts?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form action={submitComment}>
                        <Input name="client-name" defaultValue={existingClient?.client_name} placeholder required/>
                        <Input name="client-email" defaultValue={existingClient?.client_email} placeholder required/>
                        <Textarea name="client-feedback" placeholder maxlength={200} required />

                        <div>
                          <div>
                            <Checkbox name="comment-timestamp"/>
                            <Label>Leave a comment @ {currentTime}</Label>
                          </div>

                          // ===== Comment Submit button
                          <CommentSubmitButton /> go to components/SubmitButton
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      )

   }
*/
