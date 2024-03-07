// Route to get all song information from project

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";

export async function GET(request: NextRequest) {
  // 1. get project and track id parameters from request --done
  // --- get authorization from headers to determine if user or client ---
  // 2. throw them into variables --done
  // 3. use those variables to retrieve data about the project from the database
  // 4. retrieve stream url from supabase storage sdk
  // 5. return all information as one JSON response
  /*
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get("projectId")
    const trackId = searchParams.get("trackId")
    
    try {
        // Get the project information
        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            },

            select {
                title: true,
                userId: true,
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
                        comments: true
                    }
                },
                isActive: true,
            }
        })
        
        // Error out if there's no project or if there's no file
        if (!project) return response.json({success: false, message: "Could not find project", error: true}, {status: 400})

        if (!project.files) return response.json({success: false, message: "File doesn't exist", error: true},{status: 204})
        

        // Now get all of the comments of the file found. Should return only
        comments related to project
        const comments = await prisma.comment.findMany({
            where: {
                projectId: projectId
                fileId: project.files[0].id
            },

            select: {
                id: true,
                atTimeInSong: true, 
                clientId: true,
                type: true,
                isCompleted: true,
                text: true,
                createdAt: true,
                updatedAt: true
            },
        })
            
        // return project, comments 

        return response.json({data: {project, comments}, success: true, message: "ok" , error: false}, {status: 200})


    } catch (error) {
        response.json({success: false, message: "Could not retrieve details", error}, {status: 500})
    }
    
  */
}
