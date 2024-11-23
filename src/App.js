import Groq from "groq-sdk";
import { useState } from "react";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
function App() {
    const [username, setUsername] = useState('');
    const [roasting, setRoasting] = useState(false);
    const [roast, setRoast] = useState('');
    const [responseObj, setResponseObj] = useState({});
    const notify = (text) => toast.error(text);


    const groq = new Groq({
        apiKey: process.env.REACT_APP_GROQ_API,
        dangerouslyAllowBrowser: true,
    });



    async function roastfunc() {
        setRoast('');
        setRoasting(true);
        try {
            const response = await axios.get(`https://api.github.com/users/${username}`, {
                headers: {
                    Authorization: `Bearer ${process.env.REACT_APP_GITHUB_API}`
                }
            });
            if (response.status === 200) {
                const data = response.data;

                const repodata = await axios.get(`https://api.github.com/users/${username}/repos`, {
                    headers: {
                        Authorization: `Bearer ${process.env.REACT_APP_GITHUB_API}`
                    }
                });
                const repoNames = repodata.data.map(repo => repo.full_name).join(', ');
                setResponseObj(data);

                const prompt = `
                GitHub Profile Details:
                - Login: ${data.login}
                - Name: ${data.name || "N/A"}
                - Bio: ${data.bio || "N/A"}
                - Avatar URL: ${data.avatar_url}
                - Location: ${data.location || "N/A"}
                - Company: ${data.company || "N/A"}
                - Blog: ${data.blog || "N/A"}
                - Email: ${data.email || "N/A"}
                - Twitter Username: ${data.twitter_username || "N/A"}
                - Public Repositories: ${data.public_repos}
                - Public Gists: ${data.public_gists}
                - Followers: ${data.followers}
                - Following: ${data.following}
                - Account Created At: ${new Date(data.created_at).toLocaleString()}
                - Last Updated At: ${new Date(data.updated_at).toLocaleString()}
    
                API URLs:
                - Profile URL: ${data.html_url}
                - Repos URL: ${data.repos_url}
                - Followers URL: ${data.followers_url}
                - Following URL: ${data.following_url}
                - Gists URL: ${data.gists_url}
                - Organizations URL: ${data.organizations_url}
                - Starred URL: ${data.starred_url}
                - Subscriptions URL: ${data.subscriptions_url}
                - Events URL: ${data.events_url}
                - Received Events URL: ${data.received_events_url}
    
                Node Details:
                - ID: ${data.id}
                - Node ID: ${data.node_id}
                - User Type: ${data.type}
                - Admin Status: ${data.site_admin ? "Yes" : "No"}

                RepoNames : ${repoNames}
                `;

                const completion = await groq.chat.completions
                    .create({
                        messages: [
                            {
                                role: "user",
                                content: `Roast this GitHub profile in a paragraph, only generate roast text, Don't mention here is roast : 
                                ${prompt}`,
                            },
                        ],
                        model: "llama3-8b-8192",
                    });

                const roastText = completion.choices[0]?.message?.content || "No roast available.";
                setRoast(roastText);
            }
        } catch (e) {
            console.log(e);
            if (e.response && e.response.status === 403) {
                notify("Rate Limit Exceeded");
            } else {
                notify("Invalid Username");
            }
        } finally {
            setRoasting(false);
        }
    }

    return (<div className="flex justify-center items-center h-[100vh] bg-gray-100">
        <Toaster />
        <div className="flex justify-center items-center flex-col gap-6 w-[500px] shadow-xl rounded-lg p-6 bg-white">
            <p className="font-extrabold text-[30px]">GitHub Profile Roaster</p>
            <p className="text-gray-600 font-bold">Type your username and face the roast! 🔥</p>
            <input className="p-4 rounded-xl w-[80%] border-2 border-gray-400" placeholder="Enter Your GitHub Username" onChange={(e) =>
                setUsername(e.target.value)} value={username}></input>
            <button onClick={roastfunc} className={`bg-[#2463EB] p-4 text-white border-none w-[80%] rounded-xl font-bold ${roasting ? 'bg-blue-500' : ""}`}>{roasting ? 'roasting' : 'roast'}</button>
            <p className="text-gray-600 font-semibold">Made with ❤️ by <span className="text-[#2463EB]"><a href="https://github.com/AnmolTutejaGitHub" target="_blank">Anmol Tuteja</a></span></p>
            <p>{roast}</p>
        </div>
    </div >)
}
export default App;