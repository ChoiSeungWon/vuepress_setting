
module.exports = {
    home : true,
    title : "SeungWon's DevStory",
    description : 'Just playing around',
    base : '/about-me/',
    themeConfig: {
        repo: 'ChoiSeungWon/about-me',
        editLinks: true,
        docsDir: 'docs',
        lastUpdated: 'Last Updated',
        search: true,
        sidebarDepth: 3,
        nav: [{
            text: 'Home',
            link: '/'
        },
            {
                text: '최승원',
                link: '/swchoi/'
            }
        ],
        sidebar: {
            '/swchoi/': [{
                title: 'DOCUMENT',
                collapsable: true,
                children: [
                    'markdown',
                    'SpringBatch'
                ]
            }]
        }
    }
}